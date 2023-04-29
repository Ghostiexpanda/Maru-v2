const { SlashCommandBuilder } = require('discord.js');
const Birthday = require('../../../schemas/birthdaySchema');

module.exports = {
    config: {
        name: "setbirthday",
        category: "Fun",
        description: `Set your birthday`,
        usage: "setbirthday",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('setbirthday')
        .setDescription('Sets your birthday')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Your birthday in YYYY-MM-DD format')
                .setRequired(true)),
    async execute(interaction) {
        const date = interaction.options.getString('date');
        const birthday = new Date(date);
        if (isNaN(birthday)) {
            return interaction.reply({ content: 'Invalid date format. Please use YYYY-MM-DD.', ephemeral: true });
        }
        await Birthday.findOneAndUpdate(
            { guildId: interaction.guildId, userId: interaction.user.id },
            { birthday },
            { upsert: true }
        );
        await interaction.reply({ content: `Your birthday has been set to ${birthday.toDateString()}.`, ephemeral: true });
    },
};