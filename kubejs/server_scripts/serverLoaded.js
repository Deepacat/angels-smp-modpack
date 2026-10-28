ServerEvents.loaded(e => {
    let serverData = e.server.persistentData
    let firstLoad = serverData.getBoolean("firstLoad")

    if (firstLoad == true) return
    // Code ran on first server load
    serverData.putBoolean("firstLoad", true)
    
    // Default gamerules
    e.server.gameRules.set("keepInventory", true)
    e.server.gameRules.set("playersSleepingPercentage", 25)
})
