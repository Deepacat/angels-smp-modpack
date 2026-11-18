// Classes
let $DataComponents = Java.loadClass("net.minecraft.core.component.DataComponents");
let $CompoundTag = Java.loadClass("net.minecraft.nbt.CompoundTag");
let $Tag = Java.loadClass("net.minecraft.nbt.Tag");
let $MinecraftServer = Java.loadClass("net.minecraft.server.MinecraftServer");
let $CustomData = Java.loadClass("net.minecraft.world.item.component.CustomData");
let $ItemStack = Java.loadClass("net.minecraft.world.item.ItemStack");
let $TieredItem = Java.loadClass("net.minecraft.world.item.TieredItem");
let $ArmorItem = Java.loadClass("net.minecraft.world.item.ArmorItem");
let $ItemStackedOnOtherEvent = Java.loadClass("net.neoforged.neoforge.event.ItemStackedOnOtherEvent");
let $TagsUpdatedEvent = Java.loadClass("net.neoforged.neoforge.event.TagsUpdatedEvent");

// Consts
const BROKEN_ITEM_ID = 'kubejs:broken_item'
const BROKEN_TOOL_ID = 'kubejs:broken_tool'
const BROKEN_ARMOR_ID = 'kubejs:broken_armor' // legacy, no longer produced
const BROKEN_HELMET_ID = 'kubejs:broken_helmet'
const BROKEN_CHESTPLATE_ID = 'kubejs:broken_chestplate'
const BROKEN_LEGGINGS_ID = 'kubejs:broken_leggings'
const BROKEN_BOOTS_ID = 'kubejs:broken_boots'
const REPAIR_SCRAP_ID = 'kubejs:repair_scrap'
const HELD_ITEM_KEY = 'held_item'
const BROKEN_ITEMS = [
    'kubejs:broken_item',
    'kubejs:broken_tool',
    'kubejs:broken_armor',
    BROKEN_HELMET_ID,
    BROKEN_CHESTPLATE_ID,
    BROKEN_LEGGINGS_ID,
    BROKEN_BOOTS_ID
]

/** Maps an EquipmentSlot name to the broken armor item registered for it. */
const ARMOR_SLOT_BROKEN_IDS = {
    head: BROKEN_HELMET_ID,
    chest: BROKEN_CHESTPLATE_ID,
    legs: BROKEN_LEGGINGS_ID,
    feet: BROKEN_BOOTS_ID
}

/** 
 * Full scoped server var, since ItemStackedOnOtherEvent has issues obtaining server reference in its context
 * @type {$MinecraftServer || null}
 */
let gserver = null
ServerEvents.tick(e => {
    if (!gserver) gserver = e.server
})

/*
    Events below
*/

// Item click in inventory (Note this event runs on clients and server)
NativeEvents.onEvent($ItemStackedOnOtherEvent, (e) => {
    let cursorHeldStack = e.carriedItem
    let clickedSlot = e.getSlot()
    let clickedItem = clickedSlot.item
    let isRightClick = e.getClickAction().name() == "SECONDARY" ? true : false

    // Return if conditions aren't right for repair (not clicked on valid stack or not holding right item)
    if (!isRightClick) return
    if (!BROKEN_ITEMS.includes(clickedItem.id)) return

    let heldId = String(cursorHeldStack.id)
    let server = gserver

    // The broken item stores the original item it was made from. Ask that
    // original item what repairs it, so the requirement is always the item's
    // real material instead of whatever happened to be saved at break time.
    let originalStack = getStoredItem(clickedItem, server)
    if (originalStack.isEmpty()) {
        // Without the original item there is nothing to restore, so leave the
        // broken item alone instead of replacing it with an empty stack.
        return
    }

    let derivedIds = getRepairMaterials(originalStack)

    // Repair scraps only repair items that have no material of their own
    // (bows, shields, fishing rods, …).
    let canRepair = derivedIds.length > 0
        ? derivedIds.includes(heldId)
        : heldId === REPAIR_SCRAP_ID

    if (!canRepair) return

    // Remove 1 item from cursor held stack
    cursorHeldStack.setCount(cursorHeldStack.getCount() - 1)

    // Only run this on server, so client doesn't crash
    // Rest of the code should run normal for syncing modified slot behavior
    if (server) clickedSlot.set(applyRepairMaterial(originalStack))
    e.setCanceled(true)
})

// The anvil-style scan result depends on item tags, so drop it whenever tags
// change. The direct material is read live and needs no cache.
NativeEvents.onEvent($TagsUpdatedEvent, () => {
    anvilRepairCache = {}
    allRepairCandidates = null
})

// Durability damage checks for checking if a item should be converted to broken item
MEJSEvents.durabilityDamage(e => {
    let stack = e.itemStack
    if (!stack || stack.isEmpty()) return

    // Broken items are placeholders; never let one break into another broken item.
    if (BROKEN_ITEMS.includes(stack.id)) return

    let maxDamage = stack.getMaxDamage()
    if (maxDamage <= 0) return

    let damage = e.damage || 0

    // Zero-damage calls are normally not a break. The exception is a call made
    // after something set the damage directly (the death-durability mod does
    // this), where the item is already at maximum damage and this call breaks it.
    if (damage <= 0 && stack.getDamageValue() < maxDamage) return

    let entity = e.entity
    if (!entity) return

    let server = entity.getServer()
    if (!server) return

    let token = readPendingBreakToken(stack)

    // A check is already queued for this item. Fold this event into it instead
    // of queueing a second check; this is what prevented the duplicate broken
    // item when a hit and the death-durability handling both damaged the item.
    if (token && pendingBreaks[token]) return

    // A marker without a matching check is stale (for example, from a script
    // reload). Remove it and queue a fresh check.
    if (token) clearPendingBreakToken(stack)

    // Copy before the damage is applied, so all original components are kept.
    let oldStack = stack.copy()
    let newToken = createBreakToken()

    // Remember whether this stack was worn in its armor slot, so the broken
    // placeholder can be put straight back into that slot.
    let armorSlot = getArmorSlot(stack)
    let wasEquipped = false
    if (armorSlot) {
        let equippedStack = entity.getItemBySlot(armorSlot)
        wasEquipped = !equippedStack.isEmpty() && $ItemStack.isSameItemSameComponents(equippedStack, stack)
    }

    writePendingBreakToken(stack, newToken)
    pendingBreaks[newToken] = {
        stack: stack,
        oldStack: oldStack,
        entity: entity,
        server: server,
        armorSlot: armorSlot,
        wasEquipped: wasEquipped
    }

    // Verify in 1t that the damage was actually dealt before giving a broken item.
    server.scheduleInTicks(1, () => resolveBreak(newToken))
})

// Recipes
ServerEvents.recipes(e => {
    for (let brokenItemTypeID of BROKEN_ITEMS) {
        e.shapeless('kubejs:repair_scrap', [brokenItemTypeID])
            .id(`kubejs:brokenitems/repair_scrap/${brokenItemTypeID.split(':')[1]}`)
    }
})

/*
    Helpers/Methods below
*/

/**
 * Converts a 1.21 ingredient into a de-duplicated list of item IDs.
 * @param {*} ingredient The ingredient to read. May be null.
 * @returns {string[]} The item IDs that satisfy the ingredient.
 */
function ingredientToIds(ingredient) {
    if (!ingredient || ingredient.isEmpty()) return []

    // KubeJS hides Ingredient#getItems from scripts; getStackArray() is the
    // exposed equivalent and returns ItemStack[].
    let stacks = ingredient.getStackArray()
    if (!stacks) return []

    let ids = []
    for (let i = 0; i < stacks.length; i++) {
        let ingredientStack = stacks[i]
        if (!ingredientStack || ingredientStack.isEmpty()) continue
        let id = String(ingredientStack.id)
        if (id && !ids.includes(id)) ids.push(id)
    }
    return ids
}

/**
 * Reads the repair ingredient straight from the item's material/tier.
 * This is the cheap path and works for most armor and tools, but can be
 * unavailable for some items from scripts.
 *
 * @param {$ItemStack} stack The item to get repair materials for.
 * @param {*} rawItem The raw Item from stack.getItem().
 * @returns {string[]} Repair item IDs, or an empty array if none were read.
 */
function getMaterialRepairIds(stack, rawItem) {
    try {
        if (rawItem instanceof $ArmorItem) {
            let materialHolder = rawItem.getMaterial()
            if (materialHolder != null) {
                let repairSupplier = materialHolder.value().repairIngredient()
                if (repairSupplier != null) {
                    let ids = ingredientToIds(repairSupplier.get())
                    if (ids.length > 0) return ids
                }
            }
        }

        if (rawItem instanceof $TieredItem) {
            let tier = rawItem.getTier()
            if (tier != null) {
                let ids = ingredientToIds(tier.getRepairIngredient())
                if (ids.length > 0) return ids
            }
        }
    }
    catch (err) {
        console.warn(`[brokenItems] direct material lookup failed for ${stack.id}: ${err}`)
    }

    return []
}

/** Cached list of every registered item stack, used for anvil-style lookups. */
let allRepairCandidates = null

/**
 * @returns {$ItemStack[]} Every registered item stack (built once per script load).
 */
function getAllRepairCandidates() {
    if (allRepairCandidates == null) {
        try {
            allRepairCandidates = Ingredient.all.getStackArray()
        }
        catch (err) {
            console.warn(`[brokenItems] Ingredient.all failed, falling back to Item.getList(): ${err}`)
            let items = Item.getList().toArray()
            let stacks = []
            for (let i = 0; i < items.length; i++) {
                stacks.push(new $ItemStack(items[i]))
            }
            allRepairCandidates = stacks
        }
    }
    return allRepairCandidates
}

/**
 * Asks the item itself which items are valid repair materials, exactly like
 * the anvil does. This is slower than reading the material directly, but it
 * covers items whose material cannot be read from scripts and special items
 * such as elytra, shields and maces.
 *
 * @param {$ItemStack} stack The item to get repair materials for.
 * @param {*} rawItem The raw Item from stack.getItem().
 * @returns {string[]} Repair item IDs, or an empty array if none were found.
 */
function getValidationRepairIds(stack, rawItem) {
    let ids = []
    let candidates = getAllRepairCandidates()
    let errorLogged = false

    for (let i = 0; i < candidates.length; i++) {
        let candidate = candidates[i]
        if (!candidate || candidate.isEmpty()) continue

        try {
            if (rawItem.isValidRepairItem(stack, candidate)) {
                let id = String(candidate.id)
                if (id && !ids.includes(id)) ids.push(id)
            }
        }
        catch (err) {
            if (!errorLogged) {
                errorLogged = true
                console.warn(`[brokenItems] isValidRepairItem threw for ${stack.id} against ${candidate.id}: ${err}`)
            }
        }
    }

    return ids
}

/**
 * Cached results of the expensive anvil-style scan, per item ID. Only the scan
 * is cached; the item's material is always read live. Cleared when tags change
 * so it always follows material changes.
 */
let anvilRepairCache = {}

/**
 * Gets the items that can be used to repair the given item. The item's own
 * material/tier is read fresh every call, then the anvil-style scan is used for
 * items without one. Nothing is ever saved on the broken item.
 *
 * @param {$ItemStack} stack The item to get repair materials for
 * @returns {string[]} Array of material IDs that can repair the item. Empty if none found.
 */
function getRepairMaterials(stack) {
    if (!stack || stack.isEmpty()) return []

    let rawItem = stack.getItem()

    // Cheap and live: follows any material change immediately.
    let ids = getMaterialRepairIds(stack, rawItem)
    if (ids.length > 0) return ids

    // The scan over every item is expensive, so its result is cached.
    let cacheKey = String(stack.id)
    let cached = anvilRepairCache[cacheKey]
    if (cached !== undefined) return cached

    ids = getValidationRepairIds(stack, rawItem)
    anvilRepairCache[cacheKey] = ids
    return ids
}

/**
 * Gets the armor slot the given stack is worn in, if it is an armor item.
 * @param {$ItemStack} stack The stack to inspect.
 * @returns {*} The EquipmentSlot, or null when the item is not armor.
 */
function getArmorSlot(stack) {
    let rawItem = stack.getItem()
    if (!(rawItem instanceof $ArmorItem)) return null
    return rawItem.getEquipmentSlot()
}

/**
 * Chooses the correct broken-item registry ID for the original item.
 *
 * Armor becomes a slot-specific broken piece so it can stay equipped:
 *   HEAD -> broken_helmet, CHEST -> broken_chestplate,
 *   LEGS -> broken_leggings, FEET -> broken_boots.
 * Body/animal armor and anything without a matching slot falls back to the
 * generic broken item.
 *
 *   $TieredItem -> kubejs:broken_tool    (swords, pickaxes, axes, shovels, hoes)
 *   anything else -> kubejs:broken_item  (bows, shields, tridents, elytra,
 *                                          fishing rods, flint & steel, shears, …)
 *
 * @param {$ItemStack} stack The original stack that broke.
 * @returns {string} The registry ID of the broken item to award.
 */
function getBrokenItemId(stack) {
    let rawItem = stack.getItem()

    if (rawItem instanceof $ArmorItem) {
        let slot = rawItem.getEquipmentSlot()
        if (slot != null) {
            let slotId = ARMOR_SLOT_BROKEN_IDS[String(slot.getName())]
            if (slotId) return slotId
        }
        return BROKEN_ITEM_ID
    }

    if (rawItem instanceof $TieredItem) return BROKEN_TOOL_ID
    return BROKEN_ITEM_ID
}

/**
 * Serialize an ItemStack using the 1.21 item codec.
 *
 * Result format:
 *   { id: "namespace:item", count: 1, components: { ... } }
 *
 * `components` is the data-component patch, i.e. every component that differs
 * from the item's defaults. The item id restores the defaults, so id + this
 * patch is the complete item. This is not 1.20-style item NBT.
 *
 * @param {$ItemStack} stack The stack to serialize. Must not be empty.
 * @param {$MinecraftServer} server The server providing registry access.
 * @returns {$Tag} The serialized 1.21 item codec tag.
 */
function stackToTag(stack, server) {
    return stack.save(server.registryAccess())
}

/**
 * Restores the durability that one repair material restores in an anvil.
 * 1.21.1 hardcodes this as 25% of max durability (AnvilMenu: maxDamage / 4),
 * with a minimum of 1 point so tiny-durability items still come back usable.
 *
 * @param {$ItemStack} stack The stored original item. Modified in place.
 * @returns {$ItemStack} The same stack with durability restored.
 */
function applyRepairMaterial(stack) {
    let maxDamage = stack.getMaxDamage()
    if (maxDamage <= 0) return stack

    let repairAmount = Math.max(1, Math.floor(maxDamage / 4))
    let damage = stack.getDamageValue()
    if (damage <= 0) return stack

    stack.setDamageValue(Math.max(0, damage - repairAmount))
    return stack
}

/**
 * Builds an item stack of a broken item with the original items data stored in it.
 * The broken-item variant is chosen by getBrokenItemId() so armor, tools, and
 * everything else each get their own placeholder item.
 *
 * @param {$ItemStack} stack The original stack to store the data of into the broken item.
 * @param {$MinecraftServer} server The server providing registry access.
 * @returns {$ItemStack} The broken item holding the stored stack.
 */
function makeBrokenItem(stack, server) {
    let brokenItem = Item.of(getBrokenItemId(stack))

    // Store the original item at zero durability. Repairing one broken item
    // gives back exactly what one repair material gives in an anvil (25% of
    // max durability), see applyRepairMaterial().
    let storedStack = stack.copy()
    if (storedStack.getMaxDamage() > 0) {
        storedStack.setDamageValue(storedStack.getMaxDamage())
    }

    // Show "Broken " + the original item's name, using the original rarity color.
    brokenItem.setItemName(Text.literal('Broken ' + stack.hoverName.getString()))
    brokenItem.setRarity(stack.getRarity())

    let customData = new $CompoundTag()
    customData.put(HELD_ITEM_KEY, stackToTag(storedStack, server))

    $CustomData.set($DataComponents.CUSTOM_DATA, brokenItem, customData)

    // Repair materials are intentionally not saved. They are resolved from the
    // original item on every repair and tooltip, so they follow material changes.
    return brokenItem
}


/**
 * Read the original item back out of a broken item
 * @param {$ItemStack} brokenItem The broken item to read.
 * @param {$MinecraftServer} server The server providing registry access.
 * @returns {$ItemStack} The stored stack, or air if none is stored.
 */
function getStoredItem(brokenItem, server) {
    try {
        if (server == null) return Item.empty

        /** @type {$CustomData} */
        let customData = brokenItem.get($DataComponents.CUSTOM_DATA)
        if (!customData) return Item.empty

        let tag = customData.copyTag()
        if (!tag.contains(HELD_ITEM_KEY)) return Item.empty

        return $ItemStack.parseOptional(server.registryAccess(), tag.getCompound(HELD_ITEM_KEY))
    }
    catch (err) {
        console.warn(err)
        return Item.empty
    }
}

const PENDING_BREAK_KEY = 'broken_item_pending'
const BREAK_TOKEN_PREFIX = 'bb' + Math.floor(Math.random() * 0x7fffffff).toString(36) + '_'
let breakTokenCounter = 0

/**
 * Break checks queued for the current tick, keyed by item marker token.
 * One entry exists per item that is waiting to be verified, so repeated damage
 * events for the same item cannot queue duplicate checks.
 * @type {Object<string, {stack: $ItemStack, oldStack: $ItemStack, entity: any, server: $MinecraftServer, armorSlot: any, wasEquipped: boolean}>}
 */
const pendingBreaks = {}

function createBreakToken() {
    return BREAK_TOKEN_PREFIX + breakTokenCounter++
}

/**
 * Read the pending break token stored on an item, if any.
 * @param {$ItemStack} stack The stack to read.
 * @returns {string|null} The token, or null if the item has no pending break.
 */
function readPendingBreakToken(stack) {
    let customData = stack.get($DataComponents.CUSTOM_DATA)
    if (!customData) return null

    let tag = customData.copyTag()
    return tag.contains(PENDING_BREAK_KEY) ? tag.getString(PENDING_BREAK_KEY) : null
}

/**
 * Mark an item as having a break check queued for the next tick.
 * @param {$ItemStack} stack The stack to mark.
 * @param {string} token The pending break token.
 */
function writePendingBreakToken(stack, token) {
    let customData = stack.get($DataComponents.CUSTOM_DATA)
    let tag = customData ? customData.copyTag() : new $CompoundTag()

    tag.putString(PENDING_BREAK_KEY, token)
    $CustomData.set($DataComponents.CUSTOM_DATA, stack, tag)
}

/**
 * Remove the pending break marker from an item. If nothing else is stored in
 * custom data, the component is removed entirely.
 * @param {$ItemStack} stack The stack to clear.
 */
function clearPendingBreakToken(stack) {
    let customData = stack.get($DataComponents.CUSTOM_DATA)
    if (!customData) return

    let tag = customData.copyTag()
    if (!tag.contains(PENDING_BREAK_KEY)) return

    tag.remove(PENDING_BREAK_KEY)
    $CustomData.set($DataComponents.CUSTOM_DATA, stack, tag)
}

/**
 * Verify a queued break one tick after the damage event and award the broken
 * item at most once.
 * @param {string} token The pending break token.
 */
function resolveBreak(token) {
    let pending = pendingBreaks[token]
    if (!pending) return
    delete pendingBreaks[token]

    let stack = pending.stack

    // The stack still exists, even if its damage reached the maximum. It has
    // not actually broken, so giving a broken item here would duplicate the
    // original. Clear the marker so a later hit can queue a new check.
    if (!stack.isEmpty()) {
        clearPendingBreakToken(stack)
        return
    }

    // The stack is empty. A broken stack keeps the damage value that pushed it
    // over the limit, while an item that was simply dropped or removed keeps its
    // old damage. Require the damage to have reached the maximum so a removed
    // item is not mistaken for a broken one.
    if (stack.getDamageValue() < stack.getMaxDamage()) return

    if (!pending.entity.isPlayer()) return

    let brokenItem = makeBrokenItem(pending.oldStack, pending.server)

    // Put broken armor back into the slot it broke from, so it stays equipped.
    // If the slot was refilled in the meantime, hand it to the player instead.
    if (pending.wasEquipped && pending.armorSlot != null) {
        let slotStack = pending.entity.getItemBySlot(pending.armorSlot)
        if (slotStack.isEmpty()) {
            pending.entity.setItemSlot(pending.armorSlot, brokenItem)
            return
        }
    }

    pending.entity.give(brokenItem)
}
