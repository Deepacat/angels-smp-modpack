ItemEvents.rightClicked("kubejs:fentanyl", e => {
    if (e.player.hand == "OFF_HAND") return

    e.item.setCount(e.item.getCount() - 1)

    // insta effects
    e.player.potionEffects.add("minecraft:strength", 25 * 20, 3)
    e.player.potionEffects.add("minecraft:resistance", 25 * 20, 3)
    // after 25s
    e.server.scheduleInTicks(25 * 20, (t) => {
        e.player.potionEffects.add("minecraft:slowness", 30 * 20, 3)
        e.player.potionEffects.add("minecraft:weakness", 30 * 20, 3)
    })
    e.server.scheduleInTicks(30 * 20, (t) => {
        e.player.potionEffects.add("minecraft:wither", 25 * 20, 2)
    })

    e.level["playSound(net.minecraft.world.entity.player.Player,double,double,double,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)"](
        null, e.player.x, e.player.y, e.player.z, "hbm:item.syringe", "master", 1, 1)
    e.level["playSound(net.minecraft.world.entity.player.Player,double,double,double,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)"](
        null, e.player.x, e.player.y, e.player.z, "hbm:alarm.chime", "master", 1, 1)
    e.level["playSound(net.minecraft.world.entity.player.Player,double,double,double,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)"](
        null, e.player.x, e.player.y, e.player.z, "minecraft:entity.ender_dragon.growl", "master", 1, 1)
})