ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:crystallizer",
        "input": {
            "ingredient": "ae2:quartz_cluster"
        },
        "acid": {
            "type": "hbm:peroxide",
            "amount": 500
        },
        "output": {
            "id": "ae2:fluix_crystal",
            "count": 12
        },
        "duration": 600,
        "productivity": 0,
        "order": 550
    }).id("kubejs:mods/ae2/crystallizer_purefluix")
})
