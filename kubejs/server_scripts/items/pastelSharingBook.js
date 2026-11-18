let { $ServerPlayer } = require("@package/net/minecraft/server/level")

ItemEvents.firstRightClicked(e => {
    //  force cast to serverPlayer for advancements visibility
    /** @type {$ServerPlayer} */
    const player = e.player
    const { level, server, item, hand } = e

    if (item.id != "kubejs:pastel_knowledge_sharing_book") return
    if (hand != "MAIN_HAND") return
    player.swing()

    if (player.isShiftKeyDown()) {

        // If shift down, write to the book
        let pastelAdvancements = getPlayerAdvancements(player)
        let data = { "advancements": pastelAdvancements["pastel"] } || {}
        item.setCustomData(data)
        player.setStatusMessage(`§l${pastelAdvancements["pastel"]?.length || 0} §b§lAdvancements written to book.`)

    } else {

        // If shift not down, read from the book
        let itemAdvData = item.getCustomData().get("advancements") || null

        if (!itemAdvData) {
            player.setStatusMessage("§c§lThis book has no recorded knowledge.")
            return
        }

        let newLearned = []
        for (let adv of itemAdvData) {
            // Strip the quotes from evil compoundTag java strings
            let advString = String(adv).replaceAll(`"`, "")

            let serverAdv = server.getAdvancement(advString)
            if (!serverAdv) continue

            if (player.isAdvancementDone(serverAdv.holder().id())) continue
            player.unlockAdvancement(serverAdv.holder().id())

            newLearned.push(advString)
        }

        player.setStatusMessage(`§l${newLearned.length || 0} §a§lNew advancements learned.`)
    }
})

/**
 * @param {$ServerPlayer} player
 * @returns {Object<string, string[]>} advancement ID arrays grouped per mod namespace key
 */
function getPlayerAdvancements(player) {
    let advancements = {}

    player.server.advancements.allAdvancements.forEach(holder => {
        if (!player.advancements.getOrStartProgress(holder).isDone()) return

        let advId = holder.id()
        let namespace = advId.getNamespace()

        if (!advancements[namespace]) {
            advancements[namespace] = []
        }

        advancements[namespace].push(advId.toString())
    })

    return advancements
}
