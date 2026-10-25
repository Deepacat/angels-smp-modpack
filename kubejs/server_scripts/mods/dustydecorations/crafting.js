ServerEvents.recipes(e => {
    e.remove({ output: "dustydecorations:corrugated_metal_sheet" })
    e.shaped(Item.of("dustydecorations:corrugated_metal_sheet", 32), [
        "AB",
        "BA"
    ], {
        "A": "#c:ingots/iron",
        "B": "#c:ingots/copper"
    }).id("kubejs:mods/dustydecorations/corrugated_metal_sheet")
})
