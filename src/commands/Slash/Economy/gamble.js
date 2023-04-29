const { Client, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "gamble",
        category: "Economy",
        description: `Gamble your money`,
        usage: "gamble",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Gamble some money!')
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of money to gamble').setRequired(true)),
    async execute(interaction) {

        const { user, guild } = interaction;
        const amount = interaction.options.getInteger('amount');

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (Data.Wallet < amount) {
            return interaction.reply({ content: `You don't have enough money to gamble that much!`, ephemeral: true });
        }

        let negative = Math.round((Math.random() * -300) - 10);
        let positive = Math.round((Math.random() * +300) + 10);

        const posN = [negative, positive];

        const result = posN[Math.floor(Math.random() * posN.length)] * amount;

        if (!result)  return interaction.reply({ content: `You lost everything! Better luck next time.`, ephemeral: true });

        if (Data) {
            if (result > 0) {
                // Increase wallet if won
                Data.Wallet += amount;
                await Data.save();
            } else {
                // Decrease wallet if lost
                Data.Wallet -= amount;
                await Data.save();
            }
        }

        if (result > 0) {
            const positiveChoices = [
                'You won',
                'Jackpot! You won',
                'You hit the big one and won',
                'Lucky you! You won'
            ]

            const posName = Math.round((Math.random() * positiveChoices.length));

            const embed1 = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Gamble')
                .addFields({ name: 'Success', value: `${positiveChoices[posName]} $${amount}`})
                .setFooter({text: `Requested by ${interaction.user.username}`})

                await interaction.reply({ embeds: [embed1] });
        } else {
            const negativeChoices = [
                'Better luck next time. You lost',
                'You lost all your money',
                'Sorry, you lost',
                'Unlucky, you lost'
            ]

            const negName = Math.round((Math.random() * negativeChoices.length));

            const embed2 = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Gamble')
                .addFields({ name: 'Failed', value: `${negativeChoices[negName]} $${amount}`})
                .setFooter({text: `Requested by ${interaction.user.username}`})

                await interaction.reply({ embeds: [embed2] });

        }
    }
}
