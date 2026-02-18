const axios = require('axios')
const crypto = require('crypto')

let appAccessToken = null

async function getAppToken() {
    const res = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })
    appAccessToken = res.data.access_token
}

async function subscribeToStream() {
    await getAppToken()

    const userRes = await axios.get(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_CHANNEL}`, {
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appAccessToken}`
        }
    })

    const userId = userRes.data.data[0].id

    await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
        type: 'stream.online',
        version: '1',
        condition: { broadcaster_user_id: userId },
        transport: {
            method: 'webhook',
            callback: `$https://${process.env.PUBLIC_URL}/webhook`,
            secret: 'supersecret'
        }
    }, {
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${appAccessToken}`,
            'Content-Type': 'application/json'
        }
    })
}

function verifySignature(req) {
    const message = req.headers['twitch-eventsub-message-id'] +
        req.headers['twitch-eventsub-message-timestamp'] +
        JSON.stringify(req.body)

    const hmac = crypto.createHmac('sha256', 'supersecret')
    const digest = 'sha256=' + hmac.update(message).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(req.headers['twitch-eventsub-message-signature']))
}

async function setupTwitch(app) {
    app.post('/webhook', async (req, res) => {
        if (req.headers['twitch-eventsub-message-type'] === 'webhook_callback_verification') {
            return res.status(200).send(req.body.challenge)
        }

        if (!verifySignature(req)) return res.sendStatus(403)

        if (req.body.subscription.type === 'stream.online') {
            const channel = await global.discordClient.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID)
            await channel.send(`<@&Live Twitch> Ethemos_art est en live 🔴\nhttps://twitch.tv/${process.env.TWITCH_CHANNEL}`)
        }

        res.sendStatus(200)
    })

    await subscribeToStream()
}

module.exports = { setupTwitch }
