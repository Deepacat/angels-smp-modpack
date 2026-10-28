StartupEvents.registry('block', e => {
    const metalTypes = [
        "aluminum", "constantan", "copper", "electrum", "gold", "iron", "lead", "nickel", "silver", "steel", "uranium"
    ]
    const colorTypes = [
        "white", "light_gray", "gray", "black", "red", "green", "brown", "blue", "purple", "cyan", "light_blue", "yellow", "orange", "magenta", "pink"
    ]

    for (let sheetType of metalTypes) {
        e.create(`kubejs:sheetmetal_${sheetType}`)
            .displayName(`${sheetType.charAt(0).toUpperCase() + sheetType.slice(1).replace('_', ' ')} Sheet Metal Block`)
            .soundType('metal')
            .hardness(2)
            .tagBlock(['minecraft:mineable/pickaxe', 'minecraft:needs_stone_tool'])
            .tagBoth(['kubejs:sheetmetal', 'kubejs:sheetmetal_block'])
        e.create(`kubejs:slab_sheetmetal_${sheetType}`, 'slab')
            .displayName(`${sheetType.charAt(0).toUpperCase() + sheetType.slice(1).replace('_', ' ')} Sheet Metal Slab`)
            .soundType('metal')
            .hardness(2)
            .tagBlock(['minecraft:mineable/pickaxe', 'minecraft:needs_stone_tool'])
            .tagBoth(['kubejs:sheetmetal', 'kubejs:sheetmetal_slab'])
    }

    for (let sheetType of colorTypes) {
        e.create(`kubejs:sheetmetal_colored_${sheetType}`)
            .displayName(`${sheetType.charAt(0).toUpperCase() + sheetType.slice(1).replace('_', ' ')} Sheet Metal Block`)
            .soundType('metal')
            .hardness(2)
            .tagBlock(['minecraft:mineable/pickaxe', 'minecraft:needs_stone_tool'])
            .tagBoth(['kubejs:sheetmetal', 'kubejs:sheetmetal_block'])
        e.create(`kubejs:slab_sheetmetal_colored_${sheetType}`, 'slab')
            .displayName(`${sheetType.charAt(0).toUpperCase() + sheetType.slice(1).replace('_', ' ')} Sheet Metal Slab`)
            .soundType('metal')
            .hardness(2)
            .tagBlock(['minecraft:mineable/pickaxe', 'minecraft:needs_stone_tool'])
            .tagBoth(['kubejs:sheetmetal', 'kubejs:sheetmetal_slab'])
    }
})
