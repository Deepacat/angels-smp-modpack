let $BeforeLivingEntityHurtKubeEvent = Java.loadClass("dev.latvian.mods.kubejs.entity.BeforeLivingEntityHurtKubeEvent");
let $Mob = Java.loadClass("net.minecraft.world.entity.Mob");

/**
 * @typedef {Object} MobTogglingData
 * @property {Record<string, string[]>} groups Mob IDs keyed by group name.
 * @property {string[]} mods Mod IDs whose mobs are toggled together.
 * @property {string[]} [spawnTypes] Mob spawn types affected by the toggles.
 */

/** @type {MobTogglingData} */
let mobTogglingData = {
    "groups": {
        "gross_mobs": ['alexsmobs:tarantula_hawk', 'alexsmobs:crimson_mosquito', 'alexsmobs:centipede_head', "etcetera:weaver", "goety:web_spider"]
    },
    "mods": ["alexsmobs", "creaturefeature", "goety", "quark"],
    // Spawn types that toggles are allowed to prevent.
    "spawnTypes": ["NATURAL", /* "CHUNK_GENERATION", */]
}

// Build a mob id -> group names lookup once, so checks do not scan every group.
/** @type {Record<string, string[]>} */
let mobGroupsById = {}
for (let groupName in mobTogglingData.groups) {
    for (let mobId of mobTogglingData.groups[groupName]) {
        if (!mobGroupsById[mobId]) mobGroupsById[mobId] = []
        mobGroupsById[mobId].push(groupName)
    }
}

/** @type {Record<string, boolean>} */
let toggledMobIdLookup = {}
/** @type {string[]} */
let toggledMobIds = []

/**
 * Builds the persistent-data key used to store a group/mod toggle for a player.
 *
 * @param {"group" | "mod"} kind
 * @param {string} id Group name or mod ID.
 * @returns {string}
 */
function mobToggleKey(kind, id) {
    return `mob_toggle.${kind}.${id}`
}

/**
 * Gets the namespace/mod ID from an entity ID.
 *
 * @param {string} mobId
 * @returns {string}
 */
function getMobModId(mobId) {
    let separator = mobId.indexOf(":")
    return separator == -1 ? mobId : mobId.substring(0, separator)
}

/**
 * Checks whether a mob belongs to a configured group or mod.
 *
 * @param {string} mobId
 * @returns {boolean}
 */
function isMobConfigured(mobId) {
    if (mobGroupsById[mobId]) return true
    return mobTogglingData.mods.includes(getMobModId(mobId))
}

/**
 * Checks whether an entity type's base class is a Mob.
 *
 * @param {$EntityType<any>} entityType
 * @returns {boolean}
 */
function isMobEntityType(entityType) {
    let cls = entityType.getBaseClass()

    while (cls) {
        if (cls.getName() == "net.minecraft.world.entity.Mob") return true
        cls = cls.getSuperclass()
    }

    return false
}

/**
 * Collects every mob entity ID belonging to the configured mods.
 *
 * @returns {string[]}
 */
function collectModMobIds() {
    let entityTypeRegistry = /** @type {$RegistryWrapper<$EntityType<any>>} */ (Registry.of("minecraft:entity_type"))
    let keys = entityTypeRegistry.getKeys()
    let iterator = keys.iterator()
    /** @type {string[]} */
    let ids = []

    while (iterator.hasNext()) {
        let id = iterator.next()
        if (!mobTogglingData.mods.includes(id.getNamespace())) continue

        /** @type {$EntityType<any>} */
        let entityType = entityTypeRegistry.get(id)
        if (!isMobEntityType(entityType)) continue

        ids.push(id.toString())
    }

    return ids
}

/**
 * Adds a mob ID to the unique list used for goal registration.
 *
 * @param {string} mobId
 * @returns {void}
 */
function addToggledMobId(mobId) {
    if (toggledMobIdLookup[mobId]) return
    toggledMobIdLookup[mobId] = true
    toggledMobIds.push(mobId)
}

/**
 * Checks whether a group/mod toggle is disabled for a player.
 *
 * @param {$Player & $EntityKJS} player
 * @param {"group" | "mod"} kind
 * @param {string} id Group name or mod ID.
 * @returns {boolean}
 */
function isMobToggleDisabled(player, kind, id) {
    return player.persistentData.getBoolean(mobToggleKey(kind, id))
}

/**
 * Checks whether a mob is toggled off for a specific player.
 *
 * @param {$Player & $EntityKJS} player
 * @param {string} mobId
 * @returns {boolean}
 */
function isMobToggledOffForPlayer(player, mobId) {
    let groups = mobGroupsById[mobId]
    if (groups) {
        for (let groupName of groups) {
            if (isMobToggleDisabled(player, "group", groupName)) return true
        }
    }

    return isMobToggleDisabled(player, "mod", getMobModId(mobId))
}

/**
 * Gets a MobSpawnType's uppercase enum name for comparison with the config.
 *
 * @param {$MobSpawnType | null} spawnType
 * @returns {string}
 */
function mobSpawnTypeName(spawnType) {
    if (!spawnType) return ""
    if (spawnType.name) return String(spawnType.name())
    return String(spawnType)
}

/**
 * Checks whether a spawn type is configured to be prevented.
 *
 * @param {$MobSpawnType} spawnType
 * @returns {boolean}
 */
function isToggledSpawnType(spawnType) {
    let spawnTypes = mobTogglingData.spawnTypes || ["CHUNK_GENERATION", "NATURAL"]
    let name = mobSpawnTypeName(spawnType).toUpperCase()

    for (let type of spawnTypes) {
        if (String(type).toUpperCase() == name) return true
    }

    return false
}

/**
 * Checks whether a player is within 150 blocks of a spawn position.
 *
 * @param {$Player & $EntityKJS} player
 * @param {$CheckLivingEntitySpawnKubeEvent} event
 * @returns {boolean}
 */
function isPlayerInSpawnRange(player, event) {
    let dx = player.getX() - event.x
    let dy = player.getY() - event.y
    let dz = player.getZ() - event.z
    return dx * dx + dy * dy + dz * dz < 150 * 150
}

for (let groupName in mobTogglingData.groups) {
    for (let mobId of mobTogglingData.groups[groupName]) {
        addToggledMobId(mobId)
    }
}

for (let mobId of collectModMobIds()) {
    addToggledMobId(mobId)
}

/**
 * Cancels configured mob spawns near a player who has that mob toggled off.
 *
 * @param {$CheckLivingEntitySpawnKubeEvent} event
 * @returns {void}
 */
function onCheckSpawn(event) {
    let mobId = String(event.entity.type)
    if (!isToggledSpawnType(event.type)) return
    if (!isMobConfigured(mobId)) return

    let players = event.level.players

    for (let i = 0; i < players.size(); i++) {
        /** @type {$Player & $EntityKJS} */
        let player = players.get(i)
        if (!isPlayerInSpawnRange(player, event)) continue
        if (!isMobToggledOffForPlayer(player, mobId)) continue

        event.cancel()
        return
    }
}

EntityEvents.checkSpawn(e => onCheckSpawn(e))

/**
 * Cancels damage between configured mobs and players who have that mob toggled off.
 *
 * @param {$BeforeLivingEntityHurtKubeEvent} event
 * @returns {void}
 */
function onMobToggleHit(event) {
    let actualSource = event.getSource()?.actual;

    // Player cancels
    (function (e) {
        if (!e.player) return
        if (!actualSource || !isMobConfigured(actualSource.type)) return
        if (!isMobToggledOffForPlayer(e.player, actualSource.type)) return
        e.cancel()
    })(event);

    // Mob cancels
    (function (e) {
        let player = actualSource?.type == "minecraft:player" ? actualSource : null
        if (!player) return
        if (!isMobConfigured(e.entity.type)) return
        if (!isMobToggledOffForPlayer(player, e.entity.type)) return
        e.cancel()
    })(event);
}

EntityEvents.beforeHurt(e => onMobToggleHit(e))

/**
 * Toggles a group or mod for the command source's player.
 *
 * @param {$CommandContext<$CommandSourceStack>} ctx
 * @param {"group" | "mod"} kind
 * @param {string} id Group name or mod ID.
 * @returns {number}
 */
function toggleMobSpawning(ctx, kind, id) {
    let player = ctx.source.getPlayer()
    if (!player) {
        ctx.source.sendFailure(Text.literal("This command can only be used by a player."))
        return 0
    }

    let key = mobToggleKey(kind, id)
    let disabled = !player.persistentData.getBoolean(key)

    player.persistentData.putBoolean(key, disabled)
    ctx.source.sendSuccess(Text.literal(`Spawning for ${kind} ${id} is now ${disabled ? "§cdisabled" : "§aenabled"}§r for you.`), false)
    return 1
}

/**
 * Sends the current group/mod toggle status for the command source's player.
 *
 * @param {$CommandContext<$CommandSourceStack>} ctx
 * @returns {number}
 */
function sendMobToggleStatus(ctx) {
    let player = ctx.source.getPlayer()
    if (!player) {
        ctx.source.sendFailure(Text.literal("This command can only be used by a player."))
        return 0
    }

    ctx.source.sendSuccess(Text.literal("§6Mob spawn toggles for you:"), false)

    for (let groupName in mobTogglingData.groups) {
        let disabled = isMobToggleDisabled(player, "group", groupName)
        let count = mobTogglingData.groups[groupName].length
        ctx.source.sendSuccess(Text.literal(`§7- Group §f${groupName}§7 (${count} mobs): ${disabled ? "§cdisabled" : "§aenabled"}`), false)
    }

    for (let modId of mobTogglingData.mods) {
        let disabled = isMobToggleDisabled(player, "mod", modId)
        ctx.source.sendSuccess(Text.literal(`§7- Mod §f${modId}§7 (all mobs): ${disabled ? "§cdisabled" : "§aenabled"}`), false)
    }

    return 1
}

/**
 * Registers the /togglespawns command tree generated from mobTogglingData.
 *
 * @param {$CommandRegistryKubeEvent} event
 * @returns {void}
 */
function registerToggleSpawnsCommand(event) {
    let { commands: Commands } = event

    let root = Commands.literal("togglespawns")
        .executes(ctx => sendMobToggleStatus(ctx))

    let groupCommand = Commands.literal("group")
    for (let groupName in mobTogglingData.groups) {
        // iife to enclose scope
        (function (name) {
            groupCommand.then(Commands.literal(name)
                .executes(ctx => toggleMobSpawning(ctx, "group", name))
            )
        })(groupName)
    }
    root = root.then(groupCommand)

    let modCommand = Commands.literal("mod")
    for (let modId of mobTogglingData.mods) {
        // iife to enclose scope
        (function (name) {
            modCommand.then(Commands.literal(name)
                .executes(ctx => toggleMobSpawning(ctx, "mod", name))
            )
        })(modId)
    }
    root = root.then(modCommand)

    event.register(root)
}

ServerEvents.commandRegistry(e => registerToggleSpawnsCommand(e))

for (let mobId of toggledMobIds) {
    // iife to enclose scope
    (function (mobparam) {
        EntityJSEvents.addGoalSelectors(mobparam, e => {
            /**
                * @param {string}   name The name of the custom goal
                * @param {number}   priority The priority of the goal
                * @param {Function} canUse Determines if the entity can use the goal
                * @param {Function} canContinueToUse Determines if the entity can continue to use the goal, may be null
                * @param {boolean}  isInterruptable If the goal may be interrupted
                * @param {Function} start The action to perform when the goal starts
                * @param {Function} stop The action to perform when the goal stops
                * @param {boolean}  requiresUpdateEveryTick If the goal needs to be updated every tick
                * @param {Function} tick The action to perform when the goal ticks
            */
            e.customGoal('mob_toggle_target', 1,
                mob => { return true },
                mob => { return true },
                true,
                mob => { },
                mob => { },
                true,
                mob => { mobToggleTick(mob) }
            )
        })
    })(mobId)
}

// let evilGoals = [
//     "NearestAttackableTargetGoal", // centipede
//     "EntityAINearestTarget3D", // mosquito
//     "OwnerHurtTargetGoal" // tarantula hawk
// ]

/**
 * Clears a configured mob's target and attack goals when its target has that mob toggled off.
 *
 * @param {$Mob} mob
 * @returns {void}
 */
function mobToggleTick(mob) {
    try {
        /** @type {($LivingEntity & $EntityKJS) | null} */
        let target = mob.getTarget()
        // console.log(target?.type) // debug

        if (!target || target.type != "minecraft:player") return

        let player = /** @type {$Player & $EntityKJS} */ (target)
        if (!isMobToggledOffForPlayer(player, mob.type)) return

        // console.log("target is player, removing") // debug
        mob.setTarget(null)

        // console.log(`mob goals for: ${mob.type}`)
        mob.targetSelector.getAvailableGoals().forEach(goal => {
            let goalStr = goal.getGoal().toString()
            // console.log(`goal: ${goalStr}`) // debug
            goal.stop()
        })

    } catch (e) {
        console.log(e)
    }
}
