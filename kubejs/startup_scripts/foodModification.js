// Script from kjs server https://discord.com/channels/303440391124942858/1499833412742021282
// Because 1.21.1 kjs can't do ANYTHING right.

let $FoodBuilder = Java.loadClass('dev.latvian.mods.kubejs.item.FoodBuilder')

ItemEvents.modification(event => {
    // //Example of editing food values. All methods of FoodBuilder works here (except for eaten() due to a bug in KubeJS itself)
    // // https://github.com/KubeJS-Mods/KubeJS/blob/2101/src/main/java/dev/latvian/mods/kubejs/item/FoodBuilder.java
    // event.modify('pamhc2foodcore:basichamburgeritem', (item) => {
    //     let builder = setupFood(item)
    //         .nutrition(3.0)
    //         .saturation(saturationFixer(4.0, 3.0)) //Fixes an odd (vanilla) behaviour that will otherwise cause your saturation to be multiplied by Nutrition and then doubled.
    //         .effect('minecraft:regeneration', 30, 1, 1.0)
    //     item.setFood(builder.build())
    // })

    // //Removing multiple effects from a food item
    // //Array.from isn't strictly needed, just great for creating single line forEach consumers without declaring the array first
    // event.modify('minecraft:enchanted_golden_apple', (item) => {
    //     let builder = setupFood(item)
    //     Array.from(['minecraft:regeneration', 'minecraft:absorption', 'minecraft:fire_resistance', 'minecraft:resistance']).forEach(id => builder.removeEffect(id))
    //     item.setFood(builder.build())
    // })

    event.modify('kubejs:deepa_mochi', (item) => {
        item.itemName
        let builder = setupFood(item)
        builder.nutrition(5.0)
        builder.saturation(saturationFixer(7.0, 5.0))
        builder.effect('minecraft:regeneration', 2 * 20, 0, 1.0)
        item.setFood(builder.build())
    })
})

let setupFood = (originalItem) => {
    // FoodBuilder(properties) is broken as it does NOT apply default Optional.empty for usingConvertsTo, causing crashes when eating modified food
    // So lets do what it's *supposed* to do, manually
    let foodProperties = originalItem.get('food')
    let builder = new $FoodBuilder()

    if (foodProperties == null) return builder
    
    builder.nutrition(foodProperties.nutrition())
    builder.saturation(saturationFixer(foodProperties.saturation(), foodProperties.nutrition()))
    builder.alwaysEdible(foodProperties.canAlwaysEat())
    builder.eatSeconds(foodProperties.eatSeconds())

    foodProperties.effects().forEach(pf => {
        let ef = pf.effectSupplier().get()
        builder.effect(ef.getEffect().unwrapKey().get().location(), ef.getDuration(), ef.getAmplifier(), pf.probability())
    })

    return builder
}

// FoodBuilder.build() calls FoodConstants#saturationByModifier which sets saturation = nutrition * input * 2. We do the reverse to keep original saturation
let saturationFixer = (saturation, nutrition) => {
    return (saturation / nutrition) / 2
}