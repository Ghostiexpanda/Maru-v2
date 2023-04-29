const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Birthday = require('../../../schemas/birthdaySchema');

module.exports = {
  config: {
    name: "showbirthday",
    category: "Fun",
    description: `Shows your birthday`,
    usage: "showbirthday",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('showbirthday')
    .setDescription('Displays your birthday and how many days are left until your next birthday.'),
  async execute(interaction) {
    const birthdayData = await Birthday.findOne({ guildId: interaction.guildId, userId: interaction.user.id });
    if (!birthdayData) {
      return interaction.reply({ content: 'Your birthday has not been set yet.', ephemeral: true });
    }

    const birthday = new Date(birthdayData.birthday);
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`Your Birthday (${interaction.user.tag})`)
      .addFields(
        { name: 'Birthday', value: birthday.toDateString(), inline: true },
        { name: 'Days Until Next Birthday', value: daysUntilNextBirthday.toString(), inline: true }
      );
    
    await interaction.reply({ embeds: [embed]});
  },
};
