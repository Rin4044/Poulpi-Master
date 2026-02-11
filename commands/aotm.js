const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');

function formatDate(dateString) {
    const date = new Date(dateString);

    const fr = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const en = date.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });

    const monthFr = date.toLocaleDateString('fr-FR', { month: 'long' });
    const monthEn = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();

    return { fr, en, monthFr, monthEn, year };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aotm')
        .setDescription('Gestion Art Of The Month')

        // START
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Lancer le nouveau AOTM')
                .addStringOption(opt =>
                    opt.setName('theme').setDescription('Thème').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('start_date').setDescription('Date début (YYYY-MM-DD)').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('end_date').setDescription('Date fin (YYYY-MM-DD)').setRequired(true))
                .addAttachmentOption(opt =>
                    opt.setName('image_fr').setDescription('Image Canva FR').setRequired(true))
                .addAttachmentOption(opt =>
                    opt.setName('image_en').setDescription('Image Canva EN').setRequired(true))
        )

        // SOON
        .addSubcommand(sub =>
            sub.setName('soon')
                .setDescription('Annonce jours restants')
                .addIntegerOption(opt =>
                    opt.setName('days').setDescription('Nombre de jours restants').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('reference_date').setDescription('Date du mois (YYYY-MM-DD)').setRequired(true))
        )

        // END
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('Clôturer les participations')
                .addStringOption(opt =>
                    opt.setName('vote_end').setDescription('Fin des votes (YYYY-MM-DD)').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('reveal_date').setDescription('Date reveal (YYYY-MM-DD)').setRequired(true))
        )

        // RESULT
        .addSubcommand(sub =>
            sub.setName('result')
                .setDescription('Annonce des résultats')
                .addStringOption(opt =>
                    opt.setName('theme').setDescription('Thème').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('reference_date').setDescription('Date du mois (YYYY-MM-DD)').setRequired(true))
                .addUserOption(opt =>
                    opt.setName('top1').setDescription('Top 1').setRequired(true))
                .addAttachmentOption(opt =>
                    opt.setName('image1').setDescription('Image Top 1').setRequired(true))
                .addUserOption(opt =>
                    opt.setName('top2').setDescription('Top 2').setRequired(true))
                .addAttachmentOption(opt =>
                    opt.setName('image2').setDescription('Image Top 2').setRequired(true))
                .addUserOption(opt =>
                    opt.setName('top3').setDescription('Top 3').setRequired(true))
                .addAttachmentOption(opt =>
                    opt.setName('image3').setDescription('Image Top 3').setRequired(true))
        ),

    async execute(interaction) {

        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "Commande réservée au staff.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.guild.channels.cache.get(config.announcementChannelId);
        if (!channel) return interaction.editReply("Salon introuvable.");

        const sub = interaction.options.getSubcommand();

        // ================= START =================
        if (sub === 'start') {

            const theme = interaction.options.getString('theme');
            const start = formatDate(interaction.options.getString('start_date'));
            const end = formatDate(interaction.options.getString('end_date'));
            const imageFr = interaction.options.getAttachment('image_fr');
            const imageEn = interaction.options.getAttachment('image_en');

            await channel.send({
                content:
`|| @everyone ||

🇫🇷  **- Bienvenue à L’ Art du mois !**
✦ Le thème est donc **${theme}** ! Amusez-vous et challengez vous ! Que ce soit avec votre OC, avec des personnages, un décor etc.. Vous êtes libres !

✦ Vous pouvez créez n'importe quoi ! Dessin, animation, vidéo, musique.. Il faut prendre en compte qu'une récompense ne pourra pas être pris en compte pour certains comme par exemple : La bannière discord avec.. Une Musique !

✦ La date du challenge sera donc du : **${start.fr} au ${end.fr}** !

✦ La taille du dessin devrait être minimum à **2000 pixels et à 300 DPI** !

✦ Veuillez lire les règles sur l'image, et amusez-vous !

✦ Vous devrez voter pour vos 2 préférés !  Seulement **2 votes** par personne !

✦ Publiez dans le forum <#1168883454734237746>  et aidez-vous ou montrer votre progression dans <#1168883577690267699> !

✦ On a aussi besoin de quelques boost pour récupérer la bannière Discord s’il vous plait <:dead:1088615048798273666>

✿°•∘ɷ∘•°✿✿°•∘ɷ∘•°✿✿°•∘ɷ∘•°✿✿°•∘ɷ∘•°✿✿°•∘ɷ∘•°✿✿°•∘ɷ∘•°✿

🇬🇧  **- Welcome the Art of the month**

✦ The theme is **${theme}**! Have fun and challenge yourself! Whether it's with your OC, with characters, scenery etc... You're free!

✦ You can create anything! Drawing, animation, video, music... You must take into account that a reward will not be able to be taken into account for some like for example: The discord banner with... Music!

✦ The date of the challenge is: **${start.en} to ${end.en}**!

✦ The size of the drawing should be at least **2000 pixels and 300 DPI**!

✦ Please read the rules on the image, and have fun!

✦ You will have to vote for your 2 favorites ones !  Only **2 votes/person** !

✦ Post in <#1168883454734237746> and help yourself or show your progress in <#1168883577690267699>

✦ We need few boost too to be able to have the banner back please <:dead:1088615048798273666>`,
                files: [imageFr.url, imageEn.url]
            });

            return interaction.editReply("✅ AOTM lancé.");
        }

        // ================= SOON =================
        if (sub === 'soon') {

            const days = interaction.options.getInteger('days');
            const ref = formatDate(interaction.options.getString('reference_date'));

            await channel.send(
`🇬🇧 - **ONLY ${days} DAYS LEFT**

For ${ref.monthEn} AOTM, only ${days} days left!
Don't forget to participate on this community challenge!
Add your artwork in <#1168883454734237746> 

_ ||@everyone||

🇫🇷 - **PLUS QUE ${days} JOURS**

Pour cet AOTM de ${ref.monthFr}, il ne reste plus que ${days} jours !
N'oubliez pas de participer à ce défi communautaire !
Ajoutez votre œuvre d'art dans <#1168883454734237746>`
            );

            return interaction.editReply("✅ Soon envoyé.");
        }

        // ================= END =================
        if (sub === 'end') {

            const voteEnd = formatDate(interaction.options.getString('vote_end'));
            const reveal = formatDate(interaction.options.getString('reveal_date'));

            await channel.send(
`🇫🇷 - **Les entrées pour ce challenge sont terminés !**
Vous avez désormais la possibilité de voter pour celui que vous préférez : 2 votes chacuns  ! <#1168883454734237746> 
A vos votes et n'hésitez pas à complimenter les artistes ! Les votes comptes jusqu'à ${voteEnd.fr}.
Nous allons révéler les gagnants le ${reveal.fr} !

<@&1048319163992653894> 

🇬🇧 - **Entries for this challenge are closed!**
You can now vote for the one you like best: 2 votes each ! <#1168883454734237746> 
Here's to your votes, and don't hesitate to compliment the artists! Votes count until ${voteEnd.en}!

We'll reveal the winners ${reveal.en}!`
            );

            return interaction.editReply("✅ End envoyé.");
        }

        // ================= RESULT =================
        if (sub === 'result') {

            const theme = interaction.options.getString('theme');
            const ref = formatDate(interaction.options.getString('reference_date'));

            const top1 = interaction.options.getUser('top1');
            const top2 = interaction.options.getUser('top2');
            const top3 = interaction.options.getUser('top3');

            const image1 = interaction.options.getAttachment('image1');
            const image2 = interaction.options.getAttachment('image2');
            const image3 = interaction.options.getAttachment('image3');

            await channel.send({
                content:
`🇫🇷 - **RESULTAT**
Nos gagnants du mois de ${ref.monthFr} ${ref.year} pour le Art challenge sur le thème "**${theme}**" sont : 

**TOP 1** : ${top1}   Dont son dessin représente désormais notre serveur ! 
**TOP 2** : ${top2}
**TOP 3** : ${top3}

Félicitations à vous et merci à ceux qui ont votés !
Gagnants, on se rejoint dans nos messages privées pour les détails !

SOYEZ PRET POUR LE PROCHAIN THEME DU MOIS!

||<@&1048319163992653894>||

🇬🇧 - **RESULT**
Our ${ref.monthEn} ${ref.year} winners for the "**${theme}**" Art challenge are : 

**TOP 1**: ${top1}   Whose drawing now represents our server!
**TOP 2**: ${top2}
**TOP 3**: ${top3}

Congratulations to you and thanks to those who voted!

STAY TUNED FOR THE NEXT MONTH THEME!`,
                files: [image1.url, image2.url, image3.url]
            });

            return interaction.editReply("✅ Résultats envoyés.");
        }
    }
};
