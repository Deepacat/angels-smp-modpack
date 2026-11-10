// priority: 100

StartupEvents.registry('item', e => {
    // Funsies
    e.create('kubejs:deepa_mochi')
        .displayName('Deep-a-mochi')
        .tooltip("§7No!!! Please don't eat me!!!!")

    e.create('kubejs:fentanyl')
        .displayName('fentanyl')
        .maxStackSize(4)
        .tooltip("§7You... §4§l§oReally...§r§7 don't want this.")

    // Broken item related
    e.create('kubejs:repair_scrap')
        .displayName('Repair Scraps')
        .tooltip('§7Obtained by placing a broken item in the crafting grid.')
        .tooltip('§7Right click this onto a broken item inside your inventory to restore it to 1 durability.')

    e.create('kubejs:broken_item')
        .displayName('Unknown Broken Item')
        .maxStackSize(1)
        .unstackable()
        .tooltip('§7Right click this item with a Repair Scrap to restore it with 1 durability.')
        .tooltip('§7Can be crafted into a repair scrap.')

    e.create('kubejs:broken_tool')
        .displayName('Unknown Broken Tool')
        .maxStackSize(1)
        .unstackable()
        .tooltip('§7Right click this item with a Repair Scrap to restore it with 1 durability.')
        .tooltip('§7Can be crafted into a repair scrap.')

    e.create('kubejs:broken_armor')
        .displayName('Unknown Broken Armor Piece')
        .maxStackSize(1)
        .unstackable()
        .tooltip('§7Right click this item with a Repair Scrap to restore it with 1 durability.')
        .tooltip('§7Can be crafted into a repair scrap.')
})
