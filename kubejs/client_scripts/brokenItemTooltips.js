// Dynamic tooltips for broken items and repair scraps.
//
// Broken items store the original item in CUSTOM_DATA when they are created
// (see server_scripts/brokenItems.js). The repair material is resolved from
// that original item every time the tooltip is built, so it always follows the
// item's current material. Nothing about the repair material is saved on the
// broken item itself, and no tooltip is registered on the items in the startup
// registry.

let $RenderTooltipEvent$GatherComponents = Java.loadClass("net.neoforged.neoforge.client.event.RenderTooltipEvent$GatherComponents");

const $Either = Java.loadClass('com.mojang.datafixers.util.Either')
const $DataComponents = Java.loadClass("net.minecraft.core.component.DataComponents")
const $Minecraft = Java.loadClass("net.minecraft.client.Minecraft")
const $ItemStack = Java.loadClass("net.minecraft.world.item.ItemStack")
const $ArmorItem = Java.loadClass("net.minecraft.world.item.ArmorItem")
const $TieredItem = Java.loadClass("net.minecraft.world.item.TieredItem")
const $TagsUpdatedEvent = Java.loadClass("net.neoforged.neoforge.event.TagsUpdatedEvent")
const $I18n = Java.loadClass("net.minecraft.client.resources.language.I18n")
const $ChatFormatting = Java.loadClass("net.minecraft.ChatFormatting")

const REPAIR_SCRAP_ID = 'kubejs:repair_scrap'
const HELD_ITEM_KEY = 'held_item'
const BROKEN_TOOLTIP_IDS = [
    'kubejs:broken_item',
    'kubejs:broken_tool',
    'kubejs:broken_armor',
    'kubejs:broken_helmet',
    'kubejs:broken_chestplate',
    'kubejs:broken_leggings',
    'kubejs:broken_boots'
]

/** Cached anvil-scan hints, keyed by the original item ID. Runtime only. */
let anvilHintCache = {}
/** Avoids retrying a client-side anvil scan that is not supported. */
let anvilScanUnavailable = false
/** Every item stack, used for the anvil-style fallback scan. */
let allRepairCandidates = null

/** Tags with fewer items than this are listed out instead of named. */
const TAG_INLINE_LIMIT = 5

/** Temporary tooltip debug output for development. */
const DEBUG_TOOLTIPS = false
const debugLogged = {}

/**
 * Logs a debug line once per key. Only runs while DEBUG_TOOLTIPS is true.
 * @param {string} key The cache key for this message.
 * @param {string} message The message to log.
 */
function debugTooltip(key, message) {
    if (!DEBUG_TOOLTIPS || debugLogged[key]) return
    debugLogged[key] = true
    console.info(`[brokenItems] ${message}`)
}

/**
 * Converts an ingredient into a de-duplicated list of item IDs.
 * @param {*} ingredient The ingredient to read. May be null.
 * @returns {string[]} The item IDs that satisfy the ingredient.
 */
function ingredientToIds(ingredient) {
    if (!ingredient || ingredient.isEmpty()) return []

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
 * Reads the repair ingredient straight from the item's armor material or tier.
 * @param {$ItemStack} stack The original item.
 * @returns {*} The ingredient, or null when the item has no readable material.
 */
function getDirectRepairIngredient(stack) {
    let rawItem = stack.getItem()

    if (rawItem instanceof $ArmorItem) {
        let materialHolder = rawItem.getMaterial()
        if (materialHolder != null) {
            let repairSupplier = materialHolder.value().repairIngredient()
            if (repairSupplier != null) {
                let ingredient = repairSupplier.get()
                if (ingredient && !ingredient.isEmpty()) return ingredient
            }
        }
    }

    if (rawItem instanceof $TieredItem) {
        let tier = rawItem.getTier()
        if (tier != null) {
            let ingredient = tier.getRepairIngredient()
            if (ingredient && !ingredient.isEmpty()) return ingredient
        }
    }

    return null
}

/**
 * Gets the tag behind an ingredient, when the ingredient is tag-based.
 * Uses KubeJS's own helper, which knows how 1.21.1 stores tag values.
 * @param {*} ingredient The ingredient to inspect.
 * @returns {*} The TagKey, or null for item-list ingredients.
 */
function getIngredientTag(ingredient) {
    try {
        let tag = Ingredient.tagKeyOf(ingredient)
        if (tag != null) return tag
    } catch (err) { }

    // Fallback: KubeJS also exposes the tag as a property on the ingredient.
    try {
        let tag = ingredient.tagKey
        if (tag != null) return tag
    } catch (err) { }

    return null
}

/**
 * Builds a candidate tag translation key the same way EMI does:
 *   tag.<registry path>.<tag namespace>.<tag path>
 * and, for tags from other registries, tag.<registry ns>.<registry path>....
 * @param {string} prefix Key prefix ending in a dot.
 * @param {*} tag The TagKey.
 * @returns {string|null} An existing translation key, or null.
 */
function findTagTranslationKeyFor(prefix, tag) {
    let id = tag.location()
    let namespace = String(id.getNamespace())
    let path = String(id.getPath()).replace(/\//g, '.')

    let key = `${prefix}${namespace}.${path}`
    if ($I18n.exists(key)) return key

    // Older forge-namespaced tags mirror their c: equivalents.
    if (namespace == 'forge') {
        let commonKey = `${prefix}c.${path}`
        if ($I18n.exists(commonKey)) return commonKey
    }

    return null
}

/**
 * Finds the translation key of a tag, if the loaded language has one.
 * @param {*} tag The TagKey.
 * @returns {string|null} The translation key, or null.
 */
function findTagTranslationKey(tag) {
    let registryId = tag.registry().location()
    let registryNamespace = String(registryId.getNamespace())
    let registryPath = String(registryId.getPath()).replace(/\//g, '.')

    let prefix = registryNamespace == 'minecraft'
        ? `tag.${registryPath}.`
        : `tag.${registryNamespace}.${registryPath}.`

    let key = findTagTranslationKeyFor(prefix, tag)
    if (key != null) return key

    return findTagTranslationKeyFor('tag.', tag)
}

/**
 * True when advanced item tooltips (F3+H) are enabled. Used as the debug switch
 * for always showing raw tag ids.
 * @returns {boolean} Whether debug tooltips are on.
 */
function isDebugTooltips() {
    try {
        return $Minecraft.getInstance().options.advancedItemTooltips
    } catch (err) {
        return false
    }
}

/**
 * Formats a tag as its translated name, or as #namespace:path when there is no
 * translation.
 * @param {*} tag The TagKey.
 * @returns {string} The text to show in the tooltip.
 */
function formatTagName(tag) {
    let id = '#' + String(tag.location())
    let key = findTagTranslationKey(tag)
    if (key == null) return id

    return Text.translatable(key).getString()
}

/**
 * Converts an ingredient into display names.
 *
 * Tag ingredients with fewer than TAG_INLINE_LIMIT items are listed out.
 * Larger tags are named: the tag translation when one exists, otherwise
 * #namespace:path. With advanced item tooltips (debug) enabled, the raw tag id
 * is always shown instead.
 *
 * @param {*} ingredient The ingredient to read.
 * @returns {string[]} Display names, empty when the ingredient is empty.
 */
function repairNamesFromIngredient(ingredient) {
    if (!ingredient || ingredient.isEmpty()) return []

    let tag = getIngredientTag(ingredient)
    if (tag != null) {
        let id = String(tag.location())
        let itemCount = ingredientToIds(ingredient).length

        // Debug: always show the raw tag instead of a name or item list.
        if (isDebugTooltips()) {
            debugTooltip(`tag:${id}`, `tag #${id} (${itemCount} items) -> debug id "#${id}"`)
            return ['#' + id]
        }

        if (itemCount < TAG_INLINE_LIMIT) {
            let names = toRepairNames(ingredientToIds(ingredient))
            debugTooltip(`tag:${id}`, `tag #${id} (${itemCount} items) -> listed inline: [${names.join(', ')}]`)
            return names
        }

        let name = formatTagName(tag)
        debugTooltip(`tag:${id}`, `tag #${id} (${itemCount} items) -> "${name}" (key=${findTagTranslationKey(tag)})`)
        return [name]
    }

    let ids = ingredientToIds(ingredient)
    let names = toRepairNames(ids)
    debugTooltip(`items:${ids.join(',')}`, `item ingredient (${ids.length} items) -> [${names.join(', ')}]`)
    return names
}

/**
 * @returns {$ItemStack[]} Every registered item stack, built once.
 */
function getAllRepairCandidates() {
    if (allRepairCandidates == null) {
        try {
            allRepairCandidates = Ingredient.all.getStackArray()
        } catch (err) {
            // Ingredient is not exposed to every script type; the item list
            // contains the same stacks.
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
 * Asks the item itself which items repair it, like the anvil does. Covers
 * items without a readable material, such as elytra.
 * @param {$ItemStack} stack The original item.
 * @param {*} rawItem The item from stack.getItem().
 * @returns {string[]} Repair item IDs, or an empty array.
 */
function getValidatedRepairIds(stack, rawItem) {
    if (anvilScanUnavailable) return []

    let ids = []
    try {
        let candidates = getAllRepairCandidates()
        for (let i = 0; i < candidates.length; i++) {
            let candidate = candidates[i]
            if (!candidate || candidate.isEmpty()) continue
            if (rawItem.isValidRepairItem(stack, candidate)) {
                let id = String(candidate.id)
                if (id && !ids.includes(id)) ids.push(id)
            }
        }
    } catch (err) {
        anvilScanUnavailable = true
        console.warn(`[brokenItems] client anvil-style repair scan unavailable: ${err}`)
        return []
    }
    return ids
}

/**
 * Converts repair item IDs into de-duplicated display names.
 * @param {string[]} ids The repair item IDs.
 * @returns {string[]} Display names, empty when there are no repair materials.
 */
function toRepairNames(ids) {
    let names = []
    for (let id of ids) {
        let name = Item.of(id).hoverName.getString()
        if (name && !names.includes(name)) names.push(name)
    }
    return names
}

/**
 * Parses the original item stored on a broken item.
 * @param {$ItemStack} stack The broken item.
 * @returns {$ItemStack|null} The original item, or null when unavailable.
 */
function getStoredItem(stack) {
    let customData = stack.get($DataComponents.CUSTOM_DATA)
    if (!customData) return null

    let tag = customData.copyTag()
    if (!tag.contains(HELD_ITEM_KEY)) return null

    let level = $Minecraft.getInstance().level
    if (!level) return null

    let stored = $ItemStack.parseOptional(level.registryAccess(), tag.getCompound(HELD_ITEM_KEY))
    return stored && !stored.isEmpty() ? stored : null
}

/** Mod display names, keyed by namespace. Mods cannot change at runtime. */
const modNameCache = {}

/**
 * Reads the namespace (mod id) of the original item stored on a broken item.
 * @param {$ItemStack} stack The broken item.
 * @returns {string} The namespace, or an empty string when unavailable.
 */
function getOriginalItemNamespace(stack) {
    try {
        let customData = stack.get($DataComponents.CUSTOM_DATA)
        if (!customData) return ''

        let tag = customData.copyTag()
        if (!tag.contains(HELD_ITEM_KEY)) return ''

        let held = tag.getCompound(HELD_ITEM_KEY)
        if (!held.contains('id')) return ''

        let id = String(held.getString('id') || '')
        let separator = id.indexOf(':')
        return separator > 0 ? id.substring(0, separator) : 'minecraft'
    }
    catch (err) {
        return ''
    }
}

/**
 * Capitalizes every word the same way Apache's WordUtils.capitalizeFully does.
 * @param {string} text The text to capitalize.
 * @returns {string} The capitalized text.
 */
function capitalizeWords(text) {
    let words = text.split(' ')
    let result = []
    for (let i = 0; i < words.length; i++) {
        let word = words[i]
        result.push(word.length === 0 ? word : word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    }
    return result.join(' ')
}

/**
 * Gets the display name of the mod that owns a namespace, using the same rules
 * EMI uses for its mod-name tooltip line.
 * @param {string} namespace The mod id / namespace.
 * @returns {string} The mod display name.
 */
function getModDisplayName(namespace) {
    let cached = modNameCache[namespace]
    if (cached !== undefined) return cached

    let name = namespace
    try {
        if (namespace == 'c') {
            name = 'Common'
        }
        else {
            // Platform is KubeJS's own mod list wrapper; the loader's ModList
            // class is blocked by the script class filter.
            let mods = Platform.getMods()
            let mod = mods.get(namespace)
            if (mod == null) mod = mods.get(namespace.split('_').join('-'))

            name = mod != null
                ? String(mod.getName())
                : capitalizeWords(namespace.split('_').join(' '))
        }
    }
    catch (err) {
        console.warn(err)
    }

    modNameCache[namespace] = name
    return name
}

/**
 * Broken items are KubeJS items, so the mod-name tooltip line added by EMI says
 * "KubeJS". Replace it with "<original item's mod> (KubeJS)" so the tooltip
 * still shows which mod the item really came from.
 * @param {$ItemStack} stack The broken item being tooltipped.
 * @param {*} tooltipElements The gathered tooltip elements.
 */
function replaceKubeJSModName(stack, tooltipElements) {
    let namespace = getOriginalItemNamespace(stack)
    if (namespace.length === 0 || namespace == 'kubejs') {
        debugTooltip(`mod:none:${String(stack.id)}`, `mod name unchanged (original namespace="${namespace}")`)
        return
    }

    for (let i = tooltipElements.size() - 1; i >= 0; i--) {
        let element = tooltipElements.get(i)
        let text = element.left()
        if (!text.isPresent()) continue
        if (String(text.get().getString()) != 'KubeJS') continue

        let modName = getModDisplayName(namespace)
        tooltipElements.set(i, $Either.left(
            Text.literal(`${modName} (KubeJS)`).withStyle($ChatFormatting.BLUE, $ChatFormatting.ITALIC)
        ))
        debugTooltip(`mod:${namespace}`, `mod name line -> "${modName} (KubeJS)" from ${namespace}`)
        return
    }

    debugTooltip(`mod:notfound:${namespace}`, `no "KubeJS" mod name line found for namespace ${namespace}`)
}

/**
 * Works out the display names of everything that repairs a broken item, by
 * resolving the original item's current material. The direct material is read
 * live on every tooltip, so a material change shows up immediately. Only the
 * expensive anvil-style scan is cached, keyed by the original item ID.
 * @param {$ItemStack} stack The broken item being tooltipped.
 * @returns {string[]} Display names of the repair materials. Empty if none.
 */
function resolveRepairNames(stack) {
    let stored = getStoredItem(stack)
    if (!stored) return []

    // Cheap and live: follows any material change immediately. Tag ingredients
    // are shown as the tag name instead of every item in the tag.
    let ingredient = getDirectRepairIngredient(stored)
    if (ingredient != null) return repairNamesFromIngredient(ingredient)

    let cacheKey = String(stored.id)
    let cached = anvilHintCache[cacheKey]
    if (cached !== undefined) return cached

    let names = toRepairNames(getValidatedRepairIds(stored, stored.getItem()))
    anvilHintCache[cacheKey] = names
    return names
}

// The anvil-style scan depends on item tags, so drop it whenever tags change.
// The direct material is read live on every tooltip and needs no cache.
NativeEvents.onEvent($TagsUpdatedEvent, () => {
    anvilHintCache = {}
    allRepairCandidates = null
    anvilScanUnavailable = false
})

NativeEvents.onEvent($RenderTooltipEvent$GatherComponents, e => {
    let { itemStack, tooltipElements } = e
    if (!itemStack || itemStack.isEmpty()) return

    let id = String(itemStack.id)

    // Element 0 is the item's name. Inserting at index 1 puts these lines at the
    // top of the tooltip body, above attributes and above the mod name line
    // that mods such as EMI append at the end.
    let top = Math.min(1, tooltipElements.size())

    if (id === REPAIR_SCRAP_ID) {
        tooltipElements.add(top, $Either.left(Text.of('§7Obtained by placing a broken item in the crafting grid.')))
        tooltipElements.add(top + 1, $Either.left(Text.of('§7Right click this onto a broken item without a specific repair material to repair it.')))
        return
    }

    if (!BROKEN_TOOLTIP_IDS.includes(id)) return

    let names = []
    try {
        names = resolveRepairNames(itemStack)
    } catch (err) {
        console.warn(err)
    }

    // One line per usable material, so nothing is hidden behind "or … more".
    let lines = []
    if (names.length === 0) {
        lines.push('§7Right click with §fRepair Scraps§7 to repair it.')
    } else if (names.length === 1) {
        lines.push(`§7Right click with §f${names[0]}§7 to repair it.`)
    } else {
        lines.push('§7Right click with one of these to repair it:')
        for (let i = 0; i < names.length; i++) {
            let comma = i < names.length - 1 ? '§7,' : ''
            lines.push(`§f${names[i]}${comma}`)
        }
    }
    lines.push('§7Can be crafted into a repair scrap.')

    for (let i = 0; i < lines.length; i++) {
        tooltipElements.add(top + i, $Either.left(Text.of(lines[i])))
    }

    replaceKubeJSModName(itemStack, tooltipElements)
})
