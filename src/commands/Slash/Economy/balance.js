const { Client, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
    config: {
        name: "balance",
        category: "Economy",
        description: `Checks the balance`,
        usage: "balance",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('shows your balance.'),
    async execute(interaction) {

        const { user, guild } = interaction;

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        const wallet = Math.round(Data.Wallet);
        const bank = Math.round(Data.Bank);
        const total = Math.round(Data.Wallet + Data.Bank);


        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Account Balance')
            .addFields({ name: 'Balance', value: `**Wallet:** $${wallet} \n **Bank:** $${bank} \n **Total:** $${total}`, inline: true })
            .setFooter({text: `Requested by ${interaction.user.username}`})
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    }

}
