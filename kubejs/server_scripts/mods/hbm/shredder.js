ServerEvents.recipes(e => {
    e.remove({ output: "ae2:ender_dust" })
    e.custom({
        "type": "hbm:shredder",
        "input_items": [
            {
                "ingredient": "minecraft:ender_pearl"
            }
        ],
        "order": 581,
        "output_items": [
            "ae2:ender_dust"
        ]
    }).id("kubejs:mods/ae2/shredder_enderdust")

    e.remove({ output: "ae2:sky_dust" })
    e.custom({
        "type": "hbm:shredder",
        "input_items": [
            {
                "ingredient": "ae2:sky_stone_block"
            }
        ],
        "order": 582,
        "output_items": [
            "ae2:sky_dust"
        ]
    }).id("kubejs:mods/ae2/shredder_skydust")
})
