ServerEvents.tags('item', e => {

    // All NTM items
    e.add('kubejs:from_ntm', [Ingredient.of(/hbm:/).itemIds])

    /* - iron rpg tweaks related - */

    // Items that will take vanilla damage with iron rpg tweaks
    e.add('kubejs:rpg_vanilla_damage', [

    ])

    // Items that will not lose durability on death with iron rpg tweaks
    e.add('kubejs:rpg_no_death_damage', [

    ])

    /* 
    Items that will take vanilla durability damage AND not lose durability on death with iron rpg tweaks
    Add items to this for balance reasons or if there is bugs with the mod
     */
    e.add('kubejs:rpg_both', [
        // ALL NTM items, because some of them are finicky and balancing or something lol (No not every item in the tag can take dmg but wtv)
        e.get('kubejs:from_ntm').getObjectIds()
    ])

})
