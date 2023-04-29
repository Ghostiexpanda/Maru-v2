const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "withdraw",
        category: "Economy",
        description: `Withdraw some money`,
        usage: "withdraw",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank to your wallet.')
        .addStringOption(option => option.setName('amount').setDescription('The amount of money you want to withdraw.').setRequired(true)),

    async execute(interaction) {

        const { options, user, guild } = interaction;

        const amount = options.getString('amount');

        const Data = await ecoSchema.findOne({ Guild: guild.id, User: user.id });

        if (!Data) return await interaction.reply({ content: 'You do not have an account!', ephemeral: true });
        if (amount.startsWith('-')) return await interaction.reply({ content: 'You cannot withdraw a negative amount of money!', ephemeral: true });

        if (amount.toLowerCase() === 'all') {
            if (Data.Bank === 0) return await interaction.reply({ content: 'You do not have any money to withdraw!', ephemeral: true });

            Data.Wallet += Data.Bank;
            Data.Bank = 0;
            await Data.save();


            return await interaction.reply({ content: `All your money has been withdrawn`, ephemeral: true });

        } else {
            const Converted = Number(amount);

            if (isNaN(Converted) === true) return await interaction.reply({ content: 'Please enter a valid number!', ephemeral: true });


            if (Data.Bank < parseInt(Converted) || Converted === Infinity) return await interaction.reply({ content: 'You do not have enough money to withdraw!', ephemeral: true });


            Data.Wallet += parseInt(Converted);
            Data.Bank -= parseInt(Converted);
            Data.Bank = Math.abs(Data.Bank);
            await Data.save();

            const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Withdraw')
            .setDescription(`Successfully $${parseInt(Converted)} withdrawed to your wallet!`)

            return await interaction.reply({ embeds: [embed] });

        }
        }
    }
