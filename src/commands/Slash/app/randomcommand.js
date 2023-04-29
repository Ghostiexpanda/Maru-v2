const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema');

module.exports = {
    config: {
        name: "randomcommand",
        category: "app",
        description: "idfk",
        usage: "randomcommand",
        type: "slash",
        cooldown: 5
    },
     status: {
        underConstructions: false
    },
    data: new SlashCommandBuilder()
    .setName('randomcommand')
    .setDescription('just some random command for absoultly no reason'),

    async execute (interaction, bot) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        const now = new Date();
          // Check if the user has already collected their weekly money
          if (Data.lastYearly && now.getTime() - Data.lastYearly.getTime() < 31556952000) {
            return interaction.reply({ content: 'You have already collected your Yearly money. Please try again next year.', ephemeral: true });
        }

        const yearlyAmount = 2000000
        Data.Wallet += yearlyAmount;
        Data.lastYearly = now;
        await Data.save();

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Yearly Money!')
        .setDescription(`You have collected your yearly $${yearlyAmount}`)
        .setFooter({text: `Requested by ${interaction.user.username}`})
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}