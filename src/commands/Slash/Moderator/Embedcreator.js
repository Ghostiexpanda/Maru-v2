const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "embedcreator",
        category: "Moderator",
        description: `Create an embed`,
        usage: "embedcreator",
        type: "slash",
        cooldown: 5
    },
    data: new SlashCommandBuilder()
    .setName('embedcreator')
    .setDescription('This creates a custom embed')
    .addStringOption(option => option.setName('title').setDescription('This is the title of the embed').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('This is the description of the embed').setRequired(true))
    .addStringOption(option => option.setName('color').setDescription('Use a six digit hex code for the embed color').setRequired(true).setMaxLength(6))
    .addStringOption(option => option.setName('image').setDescription('This is the image of the embed').setRequired(false))
    .addStringOption(option => option.setName('thumbnail').setDescription('This is the thumbnail of the embed').setRequired(false))
    .addStringOption(option => option.setName('field-name').setDescription('This is the field name').setRequired(false))
    .addStringOption(option => option.setName('field-value').setDescription('This is the field value').setRequired(false))
    .addStringOption(option => option.setName('footer').setDescription('This is the footer of the embed').setRequired(false)),
    async execute (interaction) {
        
        const { options } = interaction;

        const title = options.getString('title');
        const description = options.getString('description');
        const color = options.getString('color');
        const image = options.getString('image');
        const thumbnail = options.getString('thumbnail');
        const fieldn = options.getString('field-name') || ' ';
        const fieldv = options.getString('field-value') || ' ';
        const footer = options.getString('footer') || ' ';

        if (image) {
            if(!image.startsWith('http')) return await interaction.reply({ content: 'You cannot make this you image', ephemeral: true})
        }

        if (thumbnail) {
            if(!thumbnail.startsWith('http')) return await interaction.reply({ content: 'You cannot make this you thumbnail', ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(parseInt(color, 16))
        .setImage(image)
        .setThumbnail(thumbnail)
        .setTimestamp()
        .addFields({ name: `${fieldn}`, value: `${fieldv}`})
        .setFooter({ text: `${footer}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true})})

        await interaction.reply({ content: 'Your embed has been sent below', ephemeral: true})

        await interaction.channel.send({ embeds: [embed] });

    }
}