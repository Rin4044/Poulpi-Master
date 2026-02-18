require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const express = require('express');
const { setupTwitch } = require('./twitch');
const { setupScheduler } = require('./scheduler');
const { setNoLiveState } = require('./twitchPanel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const app = express();
app.use(express.json());

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    await setupTwitch(app);
    setupScheduler(client);

    const commands = [];

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
    { body: commands }
);

    console.log("Slash commands mises à jour.");

    const channel = await client.channels.fetch(process.env.CONTROL_CHANNEL_ID);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('no_live')
            .setLabel('No Live Today')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('reset_live')
            .setLabel('Reset')
            .setStyle(ButtonStyle.Success)
    );

    await channel.send({
        content: '🎥 Live Control Panel',
        components: [row]
    });
});

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Erreur.", ephemeral: true });
        }
        return;
    }

    if (interaction.isButton()) {

        if (interaction.customId === "no_live") {
            setNoLiveState(true);
            await interaction.reply({
                content: "Pas de live aujourd'hui annoncé.",
                ephemeral: true
            });
        }

        if (interaction.customId === "reset_live") {
            setNoLiveState(false);
            await interaction.reply({
                content: "Annonce live réactivée.",
                ephemeral: true
            });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const FORUM_ID = [
        '1168883454734237746',
        '1471237363416957109'
    ];
    const EMOJI_ID = '1470471235367338157';

    if (!message.channel.isThread()) return;
    if (!FORUM_ID.includes(message.channel.parentId)) return;
    if (message.attachments.size === 0) return;

    await message.react(EMOJI_ID);
});

app.listen(3000);

client.login(process.env.TOKEN);
