ServerEvents.recipes(e => {
    e.remove({ output: "ae2:printed_calculation_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input": {
            "ingredient": "ae2:certus_quartz_crystal"
        },
        "output": "ae2:printed_calculation_processor",
        "stamp": "circuit",
        "order": 560
    }).id("kubejs:mods/ae2/press_printed_calculation_processor")

    e.remove({ output: "ae2:printed_engineering_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input": {
            "ingredient": "minecraft:diamond"
        },
        "output": "ae2:printed_engineering_processor",
        "stamp": "circuit",
        "order": 561
    }).id("kubejs:mods/ae2/press_printed_engineering_processor")

    e.remove({ output: "ae2:printed_silicon", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input": {
            "ingredient": "hbm:circuit_silicon"
        },
        "output": "ae2:printed_silicon",
        "stamp": "flat",
        "order": 562
    }).id("kubejs:mods/ae2/press_printed_silicon")


    e.remove({ output: "ae2:printed_logic_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input": {
            "ingredient": "minecraft:gold_ingot"
        },
        "output": "ae2:printed_logic_processor",
        "stamp": "circuit",
        "order": 563
    }).id("kubejs:mods/ae2/press_printed_logic_processor")
})
