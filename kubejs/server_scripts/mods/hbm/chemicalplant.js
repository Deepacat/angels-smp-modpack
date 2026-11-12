ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:chemical_plant",
        "name": "chem.fent",
        "input_items": [
            { "ingredient": "hbm:syringe_empty" },
            { "ingredient": "kubejs:owie", "count": 1 },
        ],
        "input_fluids": [
            { "type": "hbm:kerosene", "amount": 2000 },
            { "type": "hbm:salient", "amount": 1500 }
        ],
        "output_items": [
            { "id": "kubejs:fentanyl", "count": 1 }
        ],
        "duration": 200,
        "power": 5000
    }).id("kubejs:hbm/chemical_plant/fent")
})

// {
//     "type": "hbm:chemical_plant",
//     "name": "chem.balefire",
//     "input_items": [
//         {
//             "ingredient": "hbm:egg_balefire_shard"
//         }
//     ],
//     "input_fluids": [
//         {
//             "type": "hbm:kerosene",
//             "amount": 6000
//         }
//     ],
//     "output_items": [
//         "hbm:powder_balefire"
//     ],
//     "output_fluids": [
//         {
//             "type": "hbm:balefire",
//             "amount": 8000
//         }
//     ],
//     "duration": 100,
//     "power": 10000,
//     "icon": {
//         "id": "hbm:fluid_icon",
//         "item_data": {
//             "fluid": "hbm:balefire"
//         }
//     },
//     "order": 87
// }
