const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const levelSchema = require ("../../../schemas/level");
const Canvacord = require('canvacord');
const levelschema = require('../../../schemas/levelsetup');

module.exports = {
      config: {
        name: "rank",
        category: "Community",
        description: `Shows your level`,
        usage: "rank (user)",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('rank')
    .setDMPermission(false)
    .addUserOption(option => option.setName('user').setDescription(`Specified user's rank will be displayed.`).setRequired(false))
    .setDescription(`Displays specified user's current rank (level).`),
    async execute(interaction) {

        const levelsetup = await levelschema.findOne({ Guild: interaction.guild.id });
        if (!levelsetup || levelsetup.Disabled === 'disabled') return await interaction.reply({ content: `The **Administrators** of this server **have not** set up the **leveling system** yet!`, ephemeral: true});

        const { options, user, guild } = interaction;

        const Member = options.getMember('user') || user;

        const member = guild.members.cache.get(Member.id);

        const Data = await levelSchema.findOne({ Guild: guild.id, User: member.id});

        const embednoxp = new EmbedBuilder()
        .setColor("Purple")
        .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
        .setTimestamp()
        .setTitle(`> ${Member.username}'s Rank`)
        .setFooter({ text: `⬆ ${Member.username}'s Ranking`})
        .setAuthor({ name: `⬆ Level Playground`})
        .addFields({ name: `• Level Details`, value: `> Specified member has not gained any XP`})

        if (!Data) return await interaction.reply({ embeds: [embednoxp] });

        await interaction.deferReply();

        const Required = Data.Level * Data.Level * 20 + 20;

        const rank = new Canvacord.Rank()
        .setAvatar(member.displayAvatarURL({ forceStatic: true}))
        .setBackground("IMAGE", 'https://cdn.discordapp.com/attachments/1080219392337522718/1083370383874478220/rankbackground.png')
        .setCurrentXP(Data.XP)
        .setRequiredXP(Required)
        .setOverlay("#A020F0", 0, false)
        .setRank(1, "Rank", false)
        .setLevel(Data.Level, "Level")
        .setUsername(member.user.username)
        .setDiscriminator(member.user.discriminator)

        const Card = await rank.build();

        const attachment = new AttachmentBuilder(Card, { name: "rank.png"});

        await interaction.editReply({ files: [attachment] })

    }
}