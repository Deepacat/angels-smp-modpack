ServerEvents.recipes(e => {
    e.remove({ output: "ae2:printed_calculation_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input_items": [
            {
                "ingredient": "ae2:certus_quartz_crystal"
            }
        ],
        "order": 560,
        "output_items": [
            "ae2:printed_calculation_processor"
        ],
        "stamp": "circuit"
    }).id("kubejs:mods/ae2/press_printed_calculation_processor")

    e.remove({ output: "ae2:printed_engineering_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input_items": [
            {
                "ingredient": "minecraft:diamond"
            }
        ],
        "order": 561,
        "output_items": [
            "ae2:printed_engineering_processor"
        ],
        "stamp": "circuit"
    }).id("kubejs:mods/ae2/press_printed_engineering_processor")

    e.remove({ output: "ae2:printed_silicon", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input_items": [
            {
                "ingredient": "hbm:circuit_silicon"
            }
        ],
        "order": 562,
        "output_items": [
            "ae2:printed_silicon"
        ],
        "stamp": "flat"
    }).id("kubejs:mods/ae2/press_printed_silicon")


    e.remove({ output: "ae2:printed_logic_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:press",
        "input_items": [
            {
                "ingredient": "minecraft:gold_ingot"
            }
        ],
        "order": 563,
        "output_items": [
            "ae2:printed_logic_processor"
        ],
        "stamp": "circuit"
    }).id("kubejs:mods/ae2/press_printed_logic_processor")
})
