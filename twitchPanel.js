const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let noLiveToday = false;

function createPanel() {
    const embed = new EmbedBuilder()
        .setTitle("🎥 Twitch Control Panel")
        .setDescription("Utilise les boutons pour contrôler les annonces Twitch.")
        .setColor("#9146FF");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("no_live")
            .setLabel("No Live Today")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("reset_live")
            .setLabel("Reset")
            .setStyle(ButtonStyle.Success)
    );

    return { embed, row };
}

function getNoLiveState() {
    return noLiveToday;
}

function setNoLiveState(value) {
    noLiveToday = value;
}

module.exports = {
    createPanel,
    getNoLiveState,
    setNoLiveState
};
