const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const timeout = new Set();

module.exports = {
  config: {
    name: "fish",
    category: "Economy",
    description: `Fish for some fish`,
    usage: "fish",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Fish for a random catch.'),

  async execute(interaction) {
    const { user, guild } = interaction;

    if (timeout.has(user.id)) {
        return await interaction.reply({
          content: 'Wait 30 seconds to fish again!',
          ephemeral: true
        });
      }

    // Check if the user has a fishing rod in their inventory
    let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
    if (!userData || !userData.Inventory || userData.Inventory.length === 0 || !userData.Inventory.includes('Fishing Rod')) {
      return await interaction.reply({
        content: 'You need a fishing rod to fish!',
        ephemeral: true
      });
    }



    // Add a random catch to the user's inventory
    const catches = ['Small Fish', 'Big Fish', 'Shark', 'Seaweed'];
    const randomCatch = catches[Math.floor(Math.random() * catches.length)];

    if (!userData.Inventory) {
      userData.Inventory = [randomCatch];
    } else {
      userData.Inventory.push(randomCatch);
    }

    // Save the updated user data
    await userData.save();

    // Create and send an embed message with the catch information
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`${user.username}'s Catch`)
      .setDescription(`You caught a ${randomCatch}!`);
    await interaction.reply({ embeds: [embed] });


    timeout.add(user.id);
    setTimeout(() => {
      timeout.delete(user.id);
    }, 30000);
  }
};
