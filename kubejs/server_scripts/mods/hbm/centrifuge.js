ServerEvents.recipes(e => {
    e.custom({
        "type": "hbm:centrifuge",
        "input": {
            "ingredient": "ae2:quartz_cluster"
        },
        "outputs": [
            {
                "id": "ae2:certus_quartz_crystal",
                "count": 8
            }
        ],
        "duration": 200,
        "power": 100,
        "order": 540
    }).id("kubejs:mods/ae2/centrifuge_certusquartz")
})
