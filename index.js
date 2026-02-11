require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');

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

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    const commands = [];

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log("Mise à jour automatique des slash commands...");

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log("Slash commands mises à jour.");
    } catch (error) {
        console.error(error);
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

    try {
        await message.react(EMOJI_ID);
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error("Erreur dans la commande :", error);

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: "Erreur." });
        } else {
            await interaction.reply({ content: "Erreur.", ephemeral: true });
        }
    }
});


client.login(process.env.TOKEN);
