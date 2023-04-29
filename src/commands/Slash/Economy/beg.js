const { Client, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const cooldowns = new Map();

module.exports = {
    config: {
        name: "beg",
        category: "Economy",
        description: `Beg for money`,
        usage: "beg",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('beg for money'),
    async execute(interaction) {

        const { user, guild } = interaction;

        // Check if user is on cooldown
        if (cooldowns.has(user.id)) {
            const cooldownEnd = cooldowns.get(user.id) + 60000; // 1 minute cooldown
            const remainingTime = (cooldownEnd - Date.now()) / 1000;
            return interaction.reply({ content: `You can beg again in ${remainingTime.toFixed(1)} seconds.`, ephemeral: true });
        }

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: user.id });

        if(!Data) return interaction.reply({ content: 'You do not have an account yet. Please create one using /economy', ephemeral: true });

        const amount = Math.floor(Math.random() * 2000) + 1; // Random amount between 1 and 2000

        if(amount <= 10) {
            // 10% chance of getting no money
            return interaction.reply({ content: `You beg for money but nobody gives you anything.`, ephemeral: true });
        } else {
            // Give the user the random amount of money
            Data.Wallet += amount;
            await Data.save();
            
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Begging Successful')
                .setDescription(`You beg for money and someone gives you $${amount}!`)
                .addFields({ name: 'New Balance', value: `**Wallet:** $${Data.Wallet} \n **Bank:** $${Data.Bank}`, inline: true })
                .setFooter({text: `Requested by ${interaction.user.username}`})
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Set user on cooldown
            cooldowns.set(user.id, Date.now());
            setTimeout(() => {
                cooldowns.delete(user.id);
            }, 60000); // 1 minute cooldown
        }
    }
}
