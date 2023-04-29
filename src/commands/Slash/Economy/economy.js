const { Client, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "economy",
        category: "Economy",
        description: `Delete or create economy profile`,
        usage: "economy",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Create a new economy profile for yourself.'),
    async execute(interaction) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Account')
            .setDescription('Choose your option below.')
            .addFields({ name: 'Create', value: `Create your account.`, inline: true })
            .addFields({ name: 'Delete', value: `Delete Your account`, inline: true });

        const embed2 = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Created your account!')
            .setDescription('Account created.')
            .addFields({ name: 'Success', value: `Your account has been successfully created!`})
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        const embed3 = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Deleted your account!')
            .setDescription('Account Deleted.')
            .addFields({ name: 'Success', value: `Your account has been successfully Deleted!`})
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('page1')
                    .setEmoji('✅')
                    .setLabel('Create')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('page2')
                    .setEmoji('❌')
                    .setLabel('Delete')
                    .setStyle('Danger'),
            );

        const message = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = message.createMessageComponentCollector();

        collector.on('collect', async (i) => {

            if (i.customId === 'page1') {
                if (i.user.id !== interaction.user.id) return i.reply({ content: 'You cannot use this button.', ephemeral: true });
                
                const newData = new ecoSchema({
                    Guild: interaction.guild.id,
                    createdAt: new Date(),
                    User: user.id,
                    Bank: 0,
                    Wallet: 1000
                });

                await newData.save();

                await i.update({ embeds: [embed2], components: [] });
            } else if (i.customId === 'page2') {
                if (i.user.id !== interaction.user.id) return i.reply({ content: 'You cannot use this button.', ephemeral: true });

                await ecoSchema.deleteMany({ Guild: interaction.guild.id, User: user.id });

                await i.update({ embeds: [embed3], components: [] });
            }
        });
    },
};
