ServerEvents.recipes(e => {
    // Making this evil
    e.remove({ output: "ars_nouveau:annotated_codex" })
    e.shaped("ars_nouveau:annotated_codex", [
        "A A",
        " B ",
        "A A"
    ], {
        "A": "ars_nouveau:blank_parchment",
        "B": "ars_nouveau:wilden_tribute"
    }).id('kubejs:mods/ars_nouveau/annotated_codex')

    // Requires sunbird curse effect
    e.remove({ output: "ars_nouveau:ritual_flight" })
    e.shaped("ars_nouveau:ritual_flight", [
        " A ",
        "CBC",
        " A "
    ], {
        "A": "occultism:awakened_feather",
        "B": "ars_nouveau:wilden_wing",
        "C": "ars_nouveau:thread_feather"
    }).id('kubejs:mods/ars_nouveau/ritual_flight')
})

ItemEvents.crafted(e => {
    // Cancel craft for flight ritual if player doesn't have sunbird curse
    if (e.item.id == "ars_nouveau:ritual_flight") {
        if (e.player.hasEffect("alexsmobs:sunbird_curse") == false) {
            e.player.tell("§c§lYou lack the burden to craft such things.")
            e.item.setCount(0)
            e.player.setRemainingFireTicks(40)
            e.inventory.allItems.forEach(s => {
                if (!s.empty) {
                    e.player.give(s)
                }
            })
        }
    }
})

// Tooltip
ItemEvents.modifyTooltips(e => {
    e.modify(Ingredient.of("ars_nouveau:ritual_flight"), t => {
        t.insert(3, Component.literal("§c§lCan only be crafted whilst under the curse of a sunbird."))
    })
})