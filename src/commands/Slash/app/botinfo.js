const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { formatNumber, embedURL } = require("../../../assets/utils/utils")
const { dependencies } = require('../../../../package.json');

const moment = require('moment');

const { commandErrors } = require('../../../assets/handler/handleWebhook');
const djsversion = "14.7.1"

module.exports = {
    config: {
        name: "botinfo",
        category: "app",
        description: "Retrieves information about the bot, such as its name, version, and description. This allows users to learn more about the bot's purpose and features.",
        usage: "botinfo",
        type: "slash", // or "slash"
        cooldown: 5
    },
    status: {
        underConstructions: false
    },
    data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Shows information about the bot'),
async execute(interaction) {
    await interaction.deferReply();
    await interaction.client.application.fetch();
    const botOwner = await interaction.client.users.fetch(interaction.client.application.owner.id);
    const embed = new EmbedBuilder()
        .setColor('#7289DA')
        .setTitle(`${interaction.client.user.username} Info`)
        .setURL('https://marubot.vercel.app/')
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
            { name: 'Members', value: `${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
            { name: 'Owner', value: `${botOwner.tag}`, inline: true },
            { name: 'Created At', value: `${interaction.client.user.createdAt.toDateString()}`, inline: true },
            { name: 'Uptime', value: `${Math.floor(interaction.client.uptime / 1000 / 60 / 60)} hours`, inline: true },
            { name: 'Node.js', value: `${process.version}`, inline: true },
            { name: 'Discord.js', value: `v${require('discord.js').version}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}`});

    // Create a new row for the button
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Visit website')
                .setStyle('Link')
                .setURL('https://marubot.vercel.app/')
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Support server')
                .setStyle('Link')
                .setURL('https://discord.gg/7h7WyYteTu')
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Invite me')
                .setStyle('Link')
                .setURL('https://discord.com/oauth2/authorize?client_id=1082544311431860254&permissions=8&scope=applications.commands%20bot')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
},
};