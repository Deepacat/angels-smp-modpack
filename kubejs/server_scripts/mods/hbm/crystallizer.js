ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:crystallizer",
        "duration": 600,
        "input_fluids": [
            {
                "type": "hbm:peroxide",
                "amount": 500
            }
        ],
        "input_items": [
            {
                "ingredient": "ae2:quartz_cluster"
            }
        ],
        "order": 550,
        "output_items": [
            {
                "count": 12,
                "id": "ae2:fluix_crystal"
            }
        ],
        "productivity": 0
    }).id("kubejs:mods/ae2/crystallizer_purefluix")
})
