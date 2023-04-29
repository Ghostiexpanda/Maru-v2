const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const timeout = new Set();

module.exports = {
  config: {
    name: "dig",
    category: "Economy",
    description: `Dig for treasure`,
    usage: "dig",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('dig')
    .setDescription('Dig for a random treasure.'),

  async execute(interaction) {
    const { user, guild } = interaction;

    if (timeout.has(user.id)) {
      return await interaction.reply({
        content: 'Wait 30 seconds to dig again!',
        ephemeral: true
      });
    }

    // Check if the user has a shovel in their inventory
    let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
    if (!userData || !userData.Inventory || userData.Inventory.length === 0 || !userData.Inventory.includes('Shovel')) {
      return await interaction.reply({
        content: 'You need a shovel to dig!',
        ephemeral: true
      });
    }

    // Add a random treasure to the user's inventory
    const treasures = ['Gold Nugget', 'Diamond', 'Ruby', 'Egirls Cat Ears', 'Egirls Cat Tail' ];
    const randomTreasure = treasures[Math.floor(Math.random() * treasures.length)];

    if (!userData.Inventory) {
      userData.Inventory = [randomTreasure];
    } else {
      userData.Inventory.push(randomTreasure);
    }

    // Save the updated user data
    await userData.save();

    // Create and send an embed message with the treasure information
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`${user.username}'s Treasure`)
      .setDescription(`You dug up a ${randomTreasure}!`);
    await interaction.reply({ embeds: [embed] });

    timeout.add(user.id);
    setTimeout(() => {
      timeout.delete(user.id);
    }, 30000);
  }
};
