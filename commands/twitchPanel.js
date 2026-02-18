const { SlashCommandBuilder } = require('discord.js');
const { createPanel } = require('../twitchPanel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitchpanel')
        .setDescription('Afficher le panneau Twitch'),

    async execute(interaction) {
        const { embed, row } = createPanel();
        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
