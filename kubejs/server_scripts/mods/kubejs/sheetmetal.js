ServerEvents.recipes(e => {
    const metalTypes = ["aluminum", "constantan", "copper", "electrum", "gold", "iron", "lead", "nickel", "silver", "steel", "uranium"]
    const colorTypes = ["white", "light_gray", "gray", "black", "red", "green", "brown", "blue", "purple", "cyan", "light_blue", "yellow", "orange", "magenta", "pink"]

    // generated stonecutting recipes
    for (let sheetType of metalTypes) {
        let blockName = `kubejs:sheetmetal_${sheetType}`
        let slabName = `kubejs:slab_sheetmetal_${sheetType}`
        e.stonecutting(blockName, Ingredient.of(`#kubejs:sheetmetal_block`))
        e.stonecutting(slabName, Ingredient.of(`#kubejs:sheetmetal_slab`))
    }
    for (let sheetType of colorTypes) {
        let blockName = `kubejs:sheetmetal_colored_${sheetType}`
        let slabName = `kubejs:slab_sheetmetal_colored_${sheetType}`
        e.stonecutting(blockName, Ingredient.of(`#kubejs:sheetmetal_block`))
        e.stonecutting(slabName, Ingredient.of(`#kubejs:sheetmetal_slab`))
    }

    // shaped base item
    e.shaped(Item.of("kubejs:sheetmetal_iron", 64), [
        "III",
        "III",
        "III"
    ], {
        "I": "#c:plates/iron"
    }).id("kubejs:mods/kubejs/sheetmetal/sheetmetal_iron")
    e.shaped(Item.of("kubejs:sheetmetal_copper", 64), [
        "III",
        "III",
        "III"
    ], {
        "I": "#c:plates/copper"
    }).id("kubejs:mods/kubejs/sheetmetal/sheetmetal_copper")
})
