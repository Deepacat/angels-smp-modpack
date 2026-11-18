let $RenderTooltipEvent$GatherComponents = Java.loadClass("net.neoforged.neoforge.client.event.RenderTooltipEvent$GatherComponents");
let $Either = Java.loadClass('com.mojang.datafixers.util.Either')

NativeEvents.onEvent($RenderTooltipEvent$GatherComponents, e => {
    let { itemStack, tooltipElements } = e
    if (!itemStack || itemStack.isEmpty()) return

    let id = String(itemStack.id)

    let top = Math.min(1, tooltipElements.size())

    if (id === 'kubejs:pastel_knowledge_sharing_book') {
        let advs = itemStack.getCustomData().get('advancements') || []
        let amt = advs.length
        let tip = !amt ?
            '§cNo advancements recorded.' :
            `§a${amt} §radvancement${amt === 1 ? '' : 's'} recorded.`

        tooltipElements.add(3, $Either.left(Text.of(tip)))
    }
})
