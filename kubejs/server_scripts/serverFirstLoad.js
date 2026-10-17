ServerEvents.loaded(e => {
    let serverData = e.server.persistentData
    let firstLoad = serverData.getBool("firstLoad")

    if (firstLoad == false) {
        serverData.setBool("firstLoad", true)
        console.log("First load")
    } else {
        console.log("Not first load")
    }
})