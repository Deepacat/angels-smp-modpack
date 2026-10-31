// hi deepacat here I got really tired of trying to make this work without duping items so yes I used ai to for making the break queue system (still my idea on how to do it, never let it cook on its own oh my god)

// Classes
const { $DataComponents } = require("@package/net/minecraft/core/component")
const { $CompoundTag, $Tag } = require("@package/net/minecraft/nbt")
const { $MinecraftServer } = require("@package/net/minecraft/server")
const { $CustomData } = require("@package/net/minecraft/world/item/component")
const { $ItemStack } = require("@package/net/minecraft/world/item")
const { $ArmorItem, $TieredItem } = require("@package/net/minecraft/world/item")
const { $Ingredient } = require("@package/net/minecraft/world/item/crafting")
const { $ItemStackedOnOtherEvent } = require("@package/net/neoforged/neoforge/event")
// Consts
const BROKEN_ITEM_ID = 'kubejs:broken_item'
const BROKEN_TOOL_ID = 'kubejs:broken_tool'
const BROKEN_ARMOR_ID = 'kubejs:broken_armor'
const HELD_ITEM_KEY = 'held_item'
const BROKEN_ITEMS = ['kubejs:broken_item', 'kubejs:broken_tool', 'kubejs:broken_armor']

/*
    Events  below
*/

// Item click in inventory (Note this event runs on clients and server)
NativeEvents.onEvent($ItemStackedOnOtherEvent, (e) => {
    let player = e.player
    let cursorHeldStack = e.carriedItem
    let clickedSlot = e.getSlot()
    let clickedItem = clickedSlot.item
    let isRightClick = e.getClickAction().name() == "SECONDARY" ? true : false

    // console.log(player, heldStack, clickedSlot, clickedSlot.item.id, isRightClick) // debug

    // Return if conditions aren't right for repair (not clicked on valid stack or not holding right item)
    if (!isRightClick) return
    if (cursorHeldStack.id !== "kubejs:repair_scrap") return
    if (!BROKEN_ITEMS.includes(clickedItem.id)) return

    // Remove 1 item from cursor held stack
    cursorHeldStack.setCount(cursorHeldStack.getCount() - 1)

    // Only run this on server, so client doesn't crash
    // Rest of the code should run normal for syncing modified slot behavior
    let server = player.getServer()
    if (server != null) {
        let restoredItem = getStoredItem(clickedItem, server)
        clickedSlot.set(restoredItem)
    }

    e.setCanceled(true)
})

// Durability damage checks for checking if a item should be converted to broken item
MEJSEvents.durabilityDamage(e => {
    let stack = e.itemStack
    if (!stack || stack.isEmpty()) return

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

    writePendingBreakToken(stack, newToken)
    pendingBreaks[newToken] = {
        stack: stack,
        oldStack: oldStack,
        entity: entity,
        server: server
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
 * Gets the items that can be used to repair the given item
 * @param {$ItemStack} stack The item to get repair materials for
 * @returns {string[]} Array of material IDs that can repair the item. Empty if none found.
 */
function getRepairMaterials(stack) {
    if (stack.isEmpty()) return []

    let repairable = stack.components.get("minecraft:repairable")
    let rawItem = stack.getItem()

    if (repairable != null) {
        let ing = Ingredient.of(repairable.items.toString())
        if (!ing.isEmpty()) {
            return ing.itemIds
        }
    }
    if (rawItem instanceof $TieredItem) {
        let tier = rawItem.getTier()
        if (tier != null) {
            let repairIngredient = tier.getRepairIngredient()
            if (repairIngredient != null && !repairIngredient.isEmpty()) {
                return repairIngredient.itemIds
            }
        }
    }
    if (rawItem instanceof $ArmorItem) {
        let materialHolder = rawItem.getMaterial()
        if (materialHolder != null) {
            let repairIngredient = materialHolder.value().repairIngredient()
            if (repairIngredient != null && !repairIngredient.isEmpty()) {
                return repairIngredient.itemIds
            }
        }
    }
    return []
}

/**
 * Chooses the correct broken-item registry ID based on the original item's
 * Java class. This mirrors how repair materials are looked up: the hierarchy
 * is inspected on the raw Item, not on the KubeJS wrapper.
 *
 *   $ArmorItem  -> kubejs:broken_armor   (helmets, chestplates, leggings, boots)
 *   $TieredItem -> kubejs:broken_tool    (swords, pickaxes, axes, shovels, hoes)
 *   anything else -> kubejs:broken_item  (bows, shields, tridents, elytra,
 *                                          fishing rods, flint & steel, shears, …)
 *
 * The two branches are disjoint: no vanilla item is both an ArmorItem and a
 * TieredItem, so the order of the checks does not matter.
 *
 * @param {$ItemStack} stack The original stack that broke.
 * @returns {string} The registry ID of the broken item to award.
 */
function getBrokenItemId(stack) {
    let rawItem = stack.getItem()
    if (rawItem instanceof $ArmorItem) return BROKEN_ARMOR_ID
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

    // Store the original item at 1 durability so repairing the broken item
    // restores it with a single durability point.
    let storedStack = stack.copy()
    if (storedStack.getMaxDamage() > 0) {
        storedStack.setDamageValue(storedStack.getMaxDamage() - 1)
    }

    // Show "Broken " + the original item's name, using the original rarity color.
    brokenItem.setItemName(Text.literal('Broken ' + stack.hoverName.getString()))
    brokenItem.setRarity(stack.getRarity())

    let customData = new $CompoundTag()
    customData.put(HELD_ITEM_KEY, stackToTag(storedStack, server))

    $CustomData.set($DataComponents.CUSTOM_DATA, brokenItem, customData)
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
 * @type {Object<string, {stack: $ItemStack, oldStack: $ItemStack, entity: any, server: $MinecraftServer}>}
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
    pending.entity.give(makeBrokenItem(pending.oldStack, pending.server))
}
