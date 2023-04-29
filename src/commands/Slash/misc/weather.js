const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const weather = require('weather-js');

module.exports = {
    config: {
        name: "weather",
        category: "misc",
        description: `Check the weather of a given area`,
        usage: "weather <location> <degree-type>",
        type: "slash", // or "slash"
        cooldown: 5
    },
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Gets the weather for a specified location')
        .addStringOption(
            option => option.setName('location')
                .setDescription('The location to get the weather for')
                .setRequired(true)
        )
        .addStringOption(
            option => option.setName('degree-type')
                .setDescription('The degree type to get the weather in')
                .addChoices({ name: 'Celsius', value: 'C' }, { name: 'Fahrenheit', value: 'F' }).setRequired(true)),
                
    async execute(interaction) {
        const { options } = interaction;
        const location = options.getString('location');
        const degree = options.getString('degree-type');

        await interaction.reply({ content: 'Fetching weather...' });

        await weather.find({ search: location, degreeType: degree }, async function (err, result) {

            setTimeout(() => {
                if (err) {
                    return interaction.editReply({ content: 'An error occurred while fetching the weather.', ephemeral: true });
                } else {
                    if (result.length == 0) {
                        return interaction.editReply({ content: `No results found for ${location}!`, ephemeral: true });
                    } else {
                        const temp = result[0].current.temperature;
                        const type = result[0].current.skytext;
                        const name = result[0].location.name;
                        const feel = result[0].current.feelslike;
                        const icon = result[0].current.imageUrl;
                        const wind = result[0].current.winddisplay;
                        const day = result[0].current.day;
                        const alert = result[0].location.alert || 'None';

                        const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle(`Weather for ${name}`)
                        .addFields({ name: 'Temperature', value: `${temp}`, inline: true})
                        .addFields({ name: 'Feels Like', value: `${feel}`, inline: true})
                        .addFields({ name: 'Weather', value: `${type}`, inline: true})
                        .addFields({ name: 'Current Alerts', value: `${alert}`, inline: true})
                        .addFields({ name: 'Week Day', value: `${day}`, inline: true})
                        .addFields({ name: 'Wind Speed & Direction', value: `${wind}`, inline: true})
                        .setThumbnail(icon)

                        interaction.editReply({ content: '', embeds: [embed]});
                    }
                }
            }, 2000)
        });
    }
}