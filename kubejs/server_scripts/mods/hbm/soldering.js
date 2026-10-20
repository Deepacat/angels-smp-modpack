ServerEvents.recipes(e => {
    e.remove({ output: "ae2:engineering_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:printed_silicon"
            },
            {
                "ingredient": "minecraft:redstone"
            },
            {
                "ingredient": "ae2:printed_engineering_processor"
            }
        ],
        "order": 590,
        "output_items": [
            "ae2:engineering_processor"
        ],
        "pcb": [],
        "power": 1000,
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ]
    }).id("kubejs:mods/ae2/soldering_engineering_processor")

    e.remove({ output: "ae2:logic_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:printed_silicon"
            },
            {
                "ingredient": "minecraft:redstone"
            },
            {
                "ingredient": "ae2:printed_logic_processor"
            }
        ],
        "order": 591,
        "output_items": [
            "ae2:logic_processor"
        ],
        "pcb": [],
        "power": 1000,
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ]
    }).id("kubejs:mods/ae2/soldering_logic_processor")

    e.remove({ output: "ae2:calculation_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:printed_silicon"
            },
            {
                "ingredient": "minecraft:redstone"
            },
            {
                "ingredient": "ae2:printed_calculation_processor"
            }
        ],
        "order": 592,
        "output_items": [
            "ae2:calculation_processor"
        ],
        "pcb": [],
        "power": 1000,
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ]
    }).id("kubejs:mods/ae2/soldering_calculation_processor")
})
