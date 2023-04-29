const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "weekly",
        category: "Economy",
        description: `Get your weekly cash`,
        usage: "weekly",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Collect your weekly money.'),
    async execute(interaction) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        // Check if the user's account has been registered for at least 1 week
        const now = new Date();
        if (now.getTime() - Data.createdAt.getTime() < 604800000) {
            return interaction.reply({ content: 'Your account must be at least 1 week old to collect weekly money. Please try again later.', ephemeral: true });
        }

        // Check if the user has already collected their weekly money
        if (Data.lastWeekly && now.getTime() - Data.lastWeekly.getTime() < 604800000) {
            return interaction.reply({ content: 'You have already collected your weekly money. Please try again next week.', ephemeral: true });
        }

        // Add the amount of weekly money to the user's wallet
        const weeklyAmount = 7000; 
        Data.Wallet += weeklyAmount;
        Data.lastWeekly = now;
        await Data.save();

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Weekly Money')
            .setDescription(`You have collected your weekly $${weeklyAmount}!`)
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}