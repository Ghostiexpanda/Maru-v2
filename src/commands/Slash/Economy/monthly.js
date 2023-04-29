const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "monthly",
        category: "Economy",
        description: `Get your monthly coins`,
        usage: "monthly",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('monthly')
        .setDescription('Collect your monthly money.'),
    async execute(interaction) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        // Check if the user's account has been registered for at least 1 month
        const now = new Date();
        if (now.getTime() - Data.createdAt.getTime() < 2592000000) {
            return interaction.reply({ content: 'Your account must be at least 1 month old to collect monthly money. Please try again later.', ephemeral: true });
        }

        // Check if the user has already collected their monthly money
        if (Data.lastMonthly && now.getTime() - Data.lastMonthly.getTime() < 2592000000) {
            return interaction.reply({ content: 'You have already collected your monthly money. Please try again next month.', ephemeral: true });
        }

        // Add the amount of monthly money to the user's wallet
        const monthlyAmount = 30000;
        Data.Wallet += monthlyAmount;
        Data.lastMonthly = now;
        await Data.save();

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Monthly Money')
            .setDescription(`You have collected your monthly $${monthlyAmount}!`)
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}