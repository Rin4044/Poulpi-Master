const cron = require('node-cron');
const { getNoLiveState, setNoLiveState } = require('./twitchPanel');

function setupScheduler(client) {

    cron.schedule('0 17 * * *', async () => {
        if (getNoLiveState()) return;

        const channel = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID);

        await channel.send(
            `@Live Twitch\n\n🇬🇧 I will be live today at 9pm CET!\n🇫🇷 Je serai en live aujourd’hui à 21h !`
        );
    });

    cron.schedule('0 0 * * *', () => {
        setNoLiveState(false);
    });
}

module.exports = { setupScheduler };
