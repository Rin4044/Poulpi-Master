const cron = require('node-cron')

function setupScheduler(client, isNoLive) {
    global.discordClient = client

    cron.schedule('0 17 * * *', async () => {
        if (isNoLive()) return

        const channel = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID)

        await channel.send(`@Live Twitch\nI will be live today at 9pm CET!\nJe serai en live aujourd’hui à 21h !`)
    })

    cron.schedule('0 0 * * *', () => {
        isNoLive = false
    })
}

module.exports = { setupScheduler }
