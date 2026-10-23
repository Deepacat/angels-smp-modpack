ServerEvents.recipes(e => {
    e.remove({ output: "ae2:item_storage_cell_1k" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:cell_component_1k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:item_storage_cell_1k",
        "duration": 100,
        "consumption": 2000,
        "order": 500
    }).id("kubejs:mods/ae2/arcwelder_1kstorage")

    e.remove({ output: "ae2:item_storage_cell_4k" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:cell_component_4k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:item_storage_cell_4k",
        "duration": 100,
        "consumption": 2000,
        "order": 501
    }).id("kubejs:mods/ae2/arcwelder_4kstorage")

    e.remove({ output: "ae2:item_storage_cell_16k" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:cell_component_16k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:item_storage_cell_16k",
        "duration": 100,
        "consumption": 2000,
        "order": 502
    }).id("kubejs:mods/ae2/arcwelder_16kstorage")

    e.remove({ output: "ae2:item_storage_cell_64k" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:cell_component_64k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:item_storage_cell_64k",
        "duration": 100,
        "consumption": 2000,
        "order": 503
    }).id("kubejs:mods/ae2/arcwelder_64kstorage")

    e.remove({ output: "ae2:item_storage_cell_256k" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:cell_component_256k"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:item_storage_cell_256k",
        "duration": 100,
        "consumption": 2000,
        "order": 504
    }).id("kubejs:mods/ae2/arcwelder_256kstorage")

    e.remove({ output: "ae2:spatial_storage_cell_2" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:spatial_cell_component_2"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:spatial_storage_cell_2",
        "duration": 100,
        "consumption": 2000,
        "order": 505
    }).id("kubejs:mods/ae2/arcwelder_2spatial")

    e.remove({ output: "ae2:spatial_storage_cell_16" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:spatial_cell_component_16"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:spatial_storage_cell_16",
        "duration": 100,
        "consumption": 2000,
        "order": 506
    }).id("kubejs:mods/ae2/arcwelder_16spatial")

    e.remove({ output: "ae2:spatial_storage_cell_128" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            {
                "ingredient": "ae2:spatial_cell_component_128"
            },
            {
                "ingredient": "ae2:item_cell_housing"
            }
        ],
        "output": "ae2:spatial_storage_cell_128",
        "duration": 100,
        "consumption": 2000,
        "order": 507
    }).id("kubejs:mods/ae2/arcwelder_128spatial")
})
