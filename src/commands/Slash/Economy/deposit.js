const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "deposit",
        category: "Economy",
        description: `Disposits money`,
        usage: "deposit",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit money from your wallet to your bank.')
        .addStringOption(option => option.setName('amount').setDescription('The amount of money you want to deposit.').setRequired(true)),

    async execute(interaction) {

        const { options, user, guild } = interaction;

        const amount = options.getString('amount');

        const Data = await ecoSchema.findOne({ Guild: guild.id, User: user.id });

        if (!Data) return await interaction.reply({ content: 'You do not have an account!', ephemeral: true });
        if (amount.startsWith('-')) return await interaction.reply({ content: 'You cannot deposit a negative amount of money!', ephemeral: true });

        
        if (amount.toLowerCase() === 'all') {
            if (Data.Wallet <= 0) return await interaction.reply({ content: 'You do not have any money to deposit!', ephemeral: true });

            Data.Bank += Data.Wallet;
            Data.Wallet = 0;
            await Data.save();


            return await interaction.reply({ content: `All your money has been deposited`, ephemeral: true });

        } else {
            const Converted = Number(amount);

            if (isNaN(Converted) === true) return await interaction.reply({ content: 'Please enter a valid number!', ephemeral: true });


            if (Data.Wallet < parseInt(Converted) || Converted === Infinity) return await interaction.reply({ content: 'You do not have enough money to deposit!', ephemeral: true });


            Data.Bank += parseInt(Converted);
            Data.Wallet -= parseInt(Converted);
            Data.Wallet = Math.abs(Data.Wallet);
            await Data.save();

            const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Deposit')
            .setDescription(`Successfully $${parseInt(Converted)} to your bank!`)

            return await interaction.reply({ embeds: [embed] });

        }
        }
    }
