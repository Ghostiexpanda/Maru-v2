const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "daily",
        category: "Economy",
        description: `Get your daily money`,
        usage: "daily",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily money.'),
    async execute(interaction) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        // Check if the user's account has been registered for at least 1 day
        const now = new Date();
        if (now.getTime() - Data.createdAt.getTime() < 86400000) {
            return interaction.reply({ content: 'Your account must be at least 1 day old to collect daily money. Please try again tomorrow.', ephemeral: true });
        }

        // Check if the user has already collected their daily money
        if (Data.lastDaily && now.getTime() - Data.lastDaily.getTime() < 86400000) {
            return interaction.reply({ content: 'You have already collected your daily money. Please try again tomorrow.', ephemeral: true });
        }

        // Add the amount of daily money to the user's wallet
        const dailyAmount = 1000; // Set the amount of daily money here
        Data.Wallet += dailyAmount;
        Data.lastDaily = now;
        await Data.save();

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Daily Money')
            .setDescription(`You have collected your daily $${dailyAmount}!`)
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}