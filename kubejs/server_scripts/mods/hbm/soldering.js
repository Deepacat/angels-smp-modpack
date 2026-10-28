ServerEvents.recipes(e => {
    e.remove({ output: "ae2:engineering_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "output": "ae2:engineering_processor",
        "duration": 100,
        "consumption": 1000,
        "toppings": [
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
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "order": 590
    }).id("kubejs:mods/ae2/soldering_engineering_processor")

    e.remove({ output: "ae2:logic_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "output": "ae2:logic_processor",
        "duration": 100,
        "consumption": 1000,
        "toppings": [
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
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "order": 591
    }).id("kubejs:mods/ae2/soldering_logic_processor")

    e.remove({ output: "ae2:calculation_processor", type: "ae2:inscriber" })
    e.custom({
        "type": "hbm:soldering",
        "output": "ae2:calculation_processor",
        "duration": 100,
        "consumption": 1000,
        "toppings": [
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
        "solder": [
            {
                "count": 8,
                "ingredient": "#c:fine_wires/lead"
            }
        ],
        "order": 592
    }).id("kubejs:mods/ae2/soldering_calculation_processor")
})
