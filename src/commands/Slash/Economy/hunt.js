const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const timeout = new Set();

module.exports = {
  config: {
    name: "hunt",
    category: "Economy",
    description: `Hunt for some animals`,
    usage: "hunt",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Hunt for a random animal.'),

  async execute(interaction) {
    const { user, guild } = interaction;

    if (timeout.has(user.id)) {
      return await interaction.reply({
        content: 'Wait 30 seconds to hunt again!',
        ephemeral: true
      });
    }

    // Check if the user has a hunting rifle in their inventory
    let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
    if (!userData || !userData.Inventory || userData.Inventory.length === 0 || !userData.Inventory.includes('Hunting Rifle')) {
      return await interaction.reply({
        content: 'You need a hunting rifle to hunt!',
        ephemeral: true
      });
    }

    // Add a random animal to the user's inventory
    const animals = ['Rabbit', 'Deer', 'Bear', 'E-Girl'];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

    if (!userData.Inventory) {
      userData.Inventory = [randomAnimal];
    } else {
      userData.Inventory.push(randomAnimal);
    }

    // Save the updated user data
    await userData.save();

    // Create and send an embed message with the animal information
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`${user.username}'s Hunt`)
      .setDescription(`You hunted a ${randomAnimal}!`);
    await interaction.reply({ embeds: [embed] });

    timeout.add(user.id);
    setTimeout(() => {
      timeout.delete(user.id);
    }, 30000);
  }
};
