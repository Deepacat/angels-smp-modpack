ClientEvents.generateAssets("last", e => {
    e.json("emi:recipe/filters/hidecategories.json", {
        "filters": [
            {
                "category": "emi:grinding"
            },
            {
                "id": "/enchanting/",
                "category": "emi:anvil_repairing"
            },
            {
                "id": "/repairing\/tool/",
                "category": "emi:anvil_repairing"
            },
            {
                "id": "/smithing_template_smithing_trim/",
                "category": "minecraft:smithing"
            },
            {
                "id": "/rune_smithing/",
                "category": "minecraft:smithing"
            },
            {
                "id": "/thaumaturge.*armor_trim/",
                "category": "minecraft:smithing"
            },
            {
                "id": "/bucket/",
                "category": "emi:world_interaction"
            },
            {
                "category": "create:automatic_shaped"
            },
            {
                "category": "create:automatic_shapeless"
            },
            {
                "category": "create:automatic_packing"
            }
        ]
    })
})
