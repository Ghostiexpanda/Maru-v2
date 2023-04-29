const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { commandErrors } = require('../../../assets/handler/handleWebhook');

module.exports = {
    config: {
        name: "test",
        category: "app",
        description: "Just a simple test command",
        type: "slash",
        cooldown: 5 
    },
    data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Just a test command'),
    async execute (interaction, bot) {
        try {

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Test Command')
        .setDescription('This bot is working properly')
        .addFields({name: "test", value: `<:6316iconmoderator:1092988627027497010>` })
        

        await interaction.reply ({ embeds: [embed] });
    } catch (error) {
        commandErrors('Command Error', error.message, error.stack, interaction.guild.id, interaction.guild.name, 'test');
    }
}
}
