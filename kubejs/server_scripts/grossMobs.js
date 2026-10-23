const { $BeforeLivingEntityHurtKubeEvent } = require("@package/dev/latvian/mods/kubejs/entity");
const { $Mob } = require("@package/net/minecraft/world/entity")

let grossMobs = [
    'alexsmobs:tarantula_hawk', 'alexsmobs:crimson_mosquito',
    'alexsmobs:centipede_head'
]

// spawn cancelling for gross mobs
EntityEvents.spawned(e => {
    if (!grossMobs.includes(e.entity.type)) return

    // cancel spawns for mobs under 150 blocks from a player with tilles mode
    e.level.players.forEach(player => {
        if (player.distanceTo(e.entity.position()) >= 150) return
        let isTillesMode = player.persistentData.getBoolean("tilles_mode")
        if (isTillesMode) e.cancel()
    })
})

EntityEvents.beforeHurt(event => {
    onGrossHit(event)
})

/** @param {$BeforeLivingEntityHurtKubeEvent} event */
function onGrossHit(event) {
    let actualSource = event.getSource()?.actual;

    // Player cancels
    (function (e) {
        if (!e.player) return
        let isTillesMode = e.player.persistentData.getBoolean("tilles_mode")

        // return if mob is not a tilles mode mob
        if (actualSource && !grossMobs.includes(actualSource.type)) return

        // cancel dmg if player is in tilles mode
        if (!isTillesMode) return
        e.cancel()
    })(event);

    // Mob cancels
    (function (e) {
        let player = actualSource?.type == "minecraft:player" ? actualSource : null
        if (!player) return

        // return if mob is not a tilles mode mob
        if (!grossMobs.includes(e.entity.type)) return

        // cancel dmg if player is in tilles mode
        let isTillesMode = player.persistentData.getBoolean("tilles_mode")
        if (!isTillesMode) return
        e.cancel()
    })(event);
}

// tilles mode command to toggle
ServerEvents.commandRegistry(e => {
    const { commands: Commands, arguments: Arguments } = e
    e.register(Commands.literal("tillesmode")
        .executes(ctx => {
            let isEnabled = ctx.source.getPlayer().persistentData.getBoolean("tilles_mode")
            ctx.source.getPlayer().tell(`Tilles mode is currently ${isEnabled ? "enabled" : "disabled"}.`)
            ctx.source.getPlayer().tell(`Icky gross bug mobs ${isEnabled ? "§cwill not spawn" : "§awill spawn"} near you.`)
            return 1
        })
        .then(Commands.argument("enabled", Arguments.BOOLEAN.create(e))
            .executes(ctx => {
                let arg = Arguments.BOOLEAN.getResult(ctx, "enabled")
                ctx.source.getPlayer().persistentData.putBoolean("tilles_mode", (arg ? true : false)) // java booleans are being weird
                ctx.source.getPlayer().tell(`Tilles mode is now ${arg ? "enabled" : "disabled"}.`)
                return 1
            })
        )
    )
})

for (let grossMobID of grossMobs) {
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
            e.customGoal('goal_name', 1,
                mob => { return true },
                mob => { return true },
                true,
                mob => { },
                mob => { },
                true,
                mob => { grossMobTick(mob) }
            )
        })
    })(grossMobID)
}

// let evilGoals = [
//     "NearestAttackableTargetGoal", // centipede
//     "EntityAINearestTarget3D", // mosquito
//     "OwnerHurtTargetGoal" // tarantula hawk
// ]

/** @param {$Mob} mob */
function grossMobTick(mob) {
    try {
        let target = mob.getTarget()
        // console.log(target?.type)

        if (target?.type != "minecraft:player") return
        if(!target.persistentData.getBoolean("tilles_mode")) return
        
        // console.log("target is player, removing")
        mob.setTarget(null)

        // console.log(`mob goals for: ${mob.type}`)
        mob.targetSelector.getAvailableGoals().forEach(goal => {
            let goalStr = goal.getGoal().toString()
            // console.log(`goal: ${goalStr}`)
            goal.stop()
        })

    } catch (e) {
        console.log(e)
    }
}