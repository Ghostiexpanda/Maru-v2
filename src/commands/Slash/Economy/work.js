const { Client, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const timeout = new Set();

module.exports = {
    config: {
        name: "work",
        category: "Economy",
        description: `Work for some money`,
        usage: "work",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money!')
        .addStringOption(option =>
            option.setName('job')
                .setDescription('Select a job')
                .setRequired(true).addChoices(
                    { name: 'Developer', value: 'developer' },
                    { name: 'Artist', value: 'artist' },
                    { name: 'Writer', value: 'writer' }         
                )),
    async execute(interaction) {

        const { user, guild } = interaction;

        if (timeout.has(user.id)) {
          return await interaction.reply({
            content: 'Wait 1 hour to work again!',
            ephemeral: true
          });
        }

        const job = interaction.options.getString('job');

        let Data = await ecoSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (!Data) {
            await interaction.reply({ content: 'You do not have an account! Please use the `/economy` command to create one.', ephemeral: true });
            return;
        }

        let earnings = 0;

        switch(job) {
            case 'developer':
                earnings = Math.round((Math.random() * 200) + 100);
                break;
            case 'artist':
                earnings = Math.round((Math.random() * 150) + 50);
                break;
            case 'writer':
                earnings = Math.round((Math.random() * 100) + 25);
                break;
            default:
                return interaction.reply({ content: 'Invalid job selected.', ephemeral: true });
        }

        if (Data) {
            Data.Wallet += earnings;
            await Data.save();
        }

        const jobName = job.charAt(0).toUpperCase() + job.slice(1);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Work')
            .addFields({ name: 'Success', value: `You worked as a ${jobName} and earned $${earnings}!`})
            .setFooter({text: `Requested by ${interaction.user.username}`})

        await interaction.reply({ embeds: [embed] });

        timeout.add(user.id);
        setTimeout(() => {
            timeout.delete(user.id);
        }, 3600000);
    }  
}
