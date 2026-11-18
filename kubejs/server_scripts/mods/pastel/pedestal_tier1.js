ServerEvents.recipes(e => {
    e.custom({
        "type": "pastel:pedestal",
        "time": 40,
        "tier": "basic",
        "colors": {
            "pastel:cyan": 1,
            "pastel:magenta": 1,
            "pastel:yellow": 1,
            "pastel:white": 0,
            "pastel:black": 0
        },
        "experience": 0.1,
        "pattern": [
            "B"
        ],
        "key": {
            "B": "pastel:guidebook"
        },
        "result": {
            "id": "kubejs:pastel_knowledge_sharing_book",
            "count": 1
        },
        "required_advancement": "pastel:craft_cmy_pedestal"
    }).id(`kubejs:pastel/pedestal_tier1/sharing_book`)
})