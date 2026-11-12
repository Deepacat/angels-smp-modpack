ServerEvents.recipes(e => {
    /* Item/fluid cell recipes */
    const cells = [
        { size: "1k", consumption: 10000 },
        { size: "4k", consumption: 20000 },
        { size: "16k", consumption: 30000 },
        { size: "64k", consumption: 40000 },
        { size: "256k", consumption: 50000 }
    ]
    for (let cellObj of cells) {
        // Item cell recipe gen
        e.remove({ output: `ae2:item_storage_cell_${cellObj.size}`, type: "minecraft:crafting_shaped" })
        e.custom({
            "type": "hbm:arc_welder",
            "ingredients": [
                { "ingredient": `ae2:cell_component_${cellObj.size}` },
                { "ingredient": "ae2:item_cell_housing" }
            ],
            "output": `ae2:item_storage_cell_${cellObj.size}`,
            "duration": cellObj.consumption / 100,
            "consumption": cellObj.consumption,
        }).id(`kubejs:hbm/arcwelder/${cellObj.size}storage`)
        // Fluid cell recipe gen
        e.remove({ output: `ae2:fluid_storage_cell_${cellObj.size}`, type: "minecraft:crafting_shaped" })
        e.custom({
            "type": "hbm:arc_welder",
            "ingredients": [
                { "ingredient": `ae2:cell_component_${cellObj.size}` },
                { "ingredient": "ae2:fluid_cell_housing" }
            ],
            "output": `ae2:fluid_storage_cell_${cellObj.size}`,
            "duration": cellObj.consumption / 100,
            "consumption": cellObj.consumption,
        }).id(`kubejs:hbm/arcwelder/${cellObj.size}fluidstorage`)
    }

    /* Spatial storage recipes */
    e.remove({ output: "ae2:spatial_storage_cell_2" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            { "ingredient": "ae2:spatial_cell_component_2" },
            { "ingredient": "ae2:item_cell_housing" }
        ],
        "output": "ae2:spatial_storage_cell_2",
        "duration": 100,
        "consumption": 5000
    }).id("kubejs:mods/ae2/arcwelder_2spatial")

    e.remove({ output: "ae2:spatial_storage_cell_16" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            { "ingredient": "ae2:spatial_cell_component_16" },
            { "ingredient": "ae2:item_cell_housing" }
        ],
        "output": "ae2:spatial_storage_cell_16",
        "duration": 100,
        "consumption": 10000
    }).id("kubejs:mods/ae2/arcwelder_16spatial")

    e.remove({ output: "ae2:spatial_storage_cell_128" })
    e.custom({
        "type": "hbm:arc_welder",
        "ingredients": [
            { "ingredient": "ae2:spatial_cell_component_128" },
            { "ingredient": "ae2:item_cell_housing" }
        ],
        "output": "ae2:spatial_storage_cell_128",
        "duration": 100,
        "consumption": 20000
    }).id("kubejs:mods/ae2/arcwelder_128spatial")
})
