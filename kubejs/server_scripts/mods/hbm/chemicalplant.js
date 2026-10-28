ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:chemical_plant",
        "duration": 100,
        "input_fluids": [
            {
                "type": "minecraft:water",
                "amount": 2000
            }
        ],
        "input_items": [
            {
                "ingredient": "hbm:powder_quartz"
            },
            {
                "ingredient": "ae2:quartz_cluster"
            }
        ],
        "name": "chem.certus",
        "order": 530,
        "output_items": [
            "ae2:certus_quartz_crystal",
            "ae2:quartz_cluster"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/chem_certus")

    e.custom({
        "type": "hbm:chemical_plant",
        "duration": 100,
        "input_fluids": [
            {
                "type": "minecraft:water",
                "amount": 2000
            }
        ],
        "input_items": [
            {
                "ingredient": "ae2:charged_certus_quartz_crystal"
            },
            {
                "ingredient": "ae2:quartz_cluster"
            },
            {
                "ingredient": "minecraft:redstone"
            }
        ],
        "name": "chem.fluix",
        "order": 531,
        "output_items": [
            {
                "count": 2,
                "id": "ae2:fluix_crystal"
            },
            "ae2:quartz_cluster"
        ],
        "power": 100
    }).id("kubejs:mods/ae2/chem_fluix")

    e.custom({
        "type": "hbm:chemical_plant",
        "duration": 100,
        "input_fluids": [
            {
                "type": "minecraft:water",
                "amount": 2000
            }
        ],
        "input_items": [
            {
                "ingredient": "hbm:ingot_fiberglass"
            }
        ],
        "name": "chem.quartzfiber",
        "order": 532,
        "output_items": [
            {
                "count": 2,
                "id": "ae2:quartz_fiber"
            }
        ],
        "power": 100
    }).id("kubejs:mods/ae2/chem_quartzfiber")
})
