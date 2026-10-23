ServerEvents.recipes(e => {
    e.remove({ output: "ae2:ender_dust" })
    e.custom({
        "type": "hbm:shredder",
        "input": "minecraft:ender_pearl",
        "output": "ae2:ender_dust"
    }).id("kubejs:mods/ae2/shredder_enderdust")

    e.remove({ output: "ae2:sky_dust" })
    e.custom({
        "type": "hbm:shredder",
        "input": "ae2:sky_stone_block",
        "output": "ae2:sky_dust"
    }).id("kubejs:mods/ae2/shredder_skydust")
})
