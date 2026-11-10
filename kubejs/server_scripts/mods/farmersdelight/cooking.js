ServerEvents.recipes(e => {
    e.custom({
        "type": "farmersdelight:cooking",
        "recipe_book_tab": "meals",
        "experience": 1.0,
        "ingredients": [
            { "tag": "c:drinks/honey" },
            { "item": "farmersdelight:cooked_rice" },
            { "item": "ars_elemental:flashpine_pod" }
        ],
        "result": {
            "count": 1,
            "id": "kubejs:deepa_mochi"
        }
    }).id('kubejs:farmersdelight/cooking/deepa_mochi')

    // e.custom({
    //     "type": "farmersdelight:cooking",
    //     "experience": 0.35,
    //     "ingredients": [
    //         {
    //             "tag": "c:bones"
    //         },
    //         {
    //             "type": "neoforge:compound",
    //             "children": [
    //                 {
    //                     "item": "minecraft:glow_berries"
    //                 },
    //                 {
    //                     "tag": "c:mushrooms"
    //                 },
    //                 {
    //                     "item": "minecraft:hanging_roots"
    //                 },
    //                 {
    //                     "item": "minecraft:glow_lichen"
    //                 }
    //             ]
    //         }
    //     ],
    //     "recipe_book_tab": "meals",
    //     "result": {
    //         "count": 1,
    //         "id": "farmersdelight:bone_broth"
    //     }
    // })

    // e.custom({
    //     "type": "farmersdelight:cooking",
    //     "experience": 1.0,
    //     "ingredients": [
    //         {
    //             "item": "minecraft:apple"
    //         },
    //         {
    //             "item": "minecraft:apple"
    //         },
    //         {
    //             "item": "minecraft:sugar"
    //         }
    //     ],
    //     "recipe_book_tab": "drinks",
    //     "result": {
    //         "count": 1,
    //         "id": "farmersdelight:apple_cider"
    //     }
    // })
})