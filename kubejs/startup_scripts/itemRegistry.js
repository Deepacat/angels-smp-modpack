// priority: 100

StartupEvents.registry('item', e => {

    /* Actually useful things */

    // who up not polluting the global var space
    ((e) => {
        let sharingBook = e.create("kubejs:pastel_knowledge_sharing_book")
        sharingBook.displayName("Pastel Knowledge Sharing Book")
        sharingBook.texture("minecraft:item/book")
        sharingBook.color(0, "#e14dff")
        sharingBook.maxStackSize(1)
        sharingBook.tooltip("Shift-use §7book to record your knowledge of colors.")
        sharingBook.tooltip("Use §7book to collect the knowledge of another.")
    })(e)

    /* Funsies */

    e.create('kubejs:deepa_mochi')
        .displayName('Deep-a-mochi')
        .tooltip("§7No!!! Please don't eat me!!!!")

    e.create('kubejs:owie')
        .displayName('Owie')
        .tooltip("§7You monster.")

    e.create('kubejs:fentanyl')
        .displayName('Fentanyl')
        .maxStackSize(4)
        .tooltip("§7Feels sooooooo good!!!")
        .tooltip("§7Till it doesnt.")

    /* Broken item related */

    // Repair item for generic item without repair materials 
    e.create('kubejs:repair_scrap')
        .displayName('Repair Scraps')

    // Generic broken item that isn't a tool or armor
    e.create('kubejs:broken_item')
        .displayName('Unknown Broken Item')
        .maxStackSize(1)
        .unstackable()

    // Broken tool
    e.create('kubejs:broken_tool')
        .displayName('Unknown Broken Tool')
        .maxStackSize(1)
        .unstackable()

    // Broken armor piece 
    // Deprecated
    e.create('kubejs:broken_armor')
        .displayName('Unknown Broken Armor Piece')
        .maxStackSize(1)
        .unstackable()

    // Note these labels correlate to the armor piece types in kjs as well as name (e.g. kubejs:helmet registry type)
    const armors = ['helmet', 'chestplate', 'leggings', 'boots']

    for (let piece of armors) {
        e.create(`kubejs:broken_${piece}`, `kubejs:${piece}`)
            .fireResistant(true)
            .material('kubejs:broken')
            .displayName(`Unknown Broken ${piece.charAt(0).toUpperCase() + piece.slice(1)}`)
    }
})

StartupEvents.registry("armor_material", e => {
    // Armor tier for broken armor pieces to use
    e.create("kubejs:broken")
        .defense({ helmet: 1, chestplate: 1, leggings: 1, boots: 1, })
        .enchantmentValue(0)
        .toughness(0)
        .knockbackResistance(0.0)
        .equipSound("minecraft:item.armor.equip_netherite")
})
