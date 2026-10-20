ServerEvents.recipes(e => {
    e.remove({ output: "ae2:item_storage_cell_1k" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:cell_component_1k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 500,
        "output_items": [
            "ae2:item_storage_cell_1k"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_1kstorage")

    e.remove({ output: "ae2:item_storage_cell_4k" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:cell_component_4k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 501,
        "output_items": [
            "ae2:item_storage_cell_4k"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_4kstorage")

    e.remove({ output: "ae2:item_storage_cell_16k" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:cell_component_16k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 502,
        "output_items": [
            "ae2:item_storage_cell_16k"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_16kstorage")

    e.remove({ output: "ae2:item_storage_cell_64k" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:cell_component_64k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 503,
        "output_items": [
            "ae2:item_storage_cell_64k"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_64kstorage")

    e.remove({ output: "ae2:item_storage_cell_256k" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:cell_component_256k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 504,
        "output_items": [
            "ae2:item_storage_cell_256k"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_256kstorage")

    e.remove({ output: "ae2:spatial_storage_cell_2" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:spatial_cell_component_2"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 505,
        "output_items": [
            "ae2:spatial_storage_cell_2"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_2spatial")

    e.remove({ output: "ae2:spatial_storage_cell_16" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:spatial_cell_component_16"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 506,
        "output_items": [
            "ae2:spatial_storage_cell_16"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_16spatial")

    e.remove({ output: "ae2:spatial_storage_cell_128" })
    e.custom({
        "type": "hbm:arc_welder",
        "duration": 100,
        "input_items": [
            {
                "ingredient": "ae2:spatial_cell_component_128"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "order": 507,
        "output_items": [
            "ae2:spatial_storage_cell_128"
        ],
        "power": 2000
    }).id("kubejs:mods/ae2/arcwelder_128spatial")
})
