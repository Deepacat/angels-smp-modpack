PlayerEvents.loggedIn(e => {
    let firstJoin = e.player.stages.has('firstJoin')
    let day = `It is currently day ${Math.floor(e.server.getLevel("minecraft:overworld").dayTime() / 24000)}.`
    let playerName = e.player.getDisplayName().string

    if (!firstJoin) {
        e.player.stages.add('firstJoin')
        e.player.give('ftbquests:book')
        e.player.tell(`\n§bWelcome! Read your questbook for rules and modpack information.`)
        e.player.tell(`§b${day}\n`)
        e.server.tell(`§e§l${playerName} joined for the first time!`)
    } else {
        e.player.tell(`\n§bWelcome back ${playerName}!`)
        e.player.tell(`§b${day}\n`)
    }
})
