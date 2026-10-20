ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:centrifuge",
        "duration": 200,
        "input_items": [
            {
                "ingredient": "ae2:quartz_cluster"
            }
        ],
        "order": 540,
        "output_items": [
            {
                "count": 8,
                "id": "ae2:certus_quartz_crystal"
            }
        ],
        "power": 100
    }).id("kubejs:mods/ae2/centrifuge_certusquartz")
})
