const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
  config: {
    name: "inventory",
    category: "Economy",
    description: `Check your inventory`,
    usage: "inventory",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory.'),

  async execute(interaction) {
    const { user, guild } = interaction;

    let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
    if (!userData || !userData.Inventory || userData.Inventory.length === 0) {
      return await interaction.reply({
        content: 'Your inventory is empty!',
        ephemeral: true
      });
    }

    const inventory = userData.Inventory;
    const items = {};

    // Count the number of each item in the inventory
    inventory.forEach(item => {
      if (!items[item]) {
        items[item] = 0;
      }
      items[item]++;
    });

    // Create an array of inventory items with their quantities
    const inventoryItems = Object.keys(items).map(item => `${item} x${items[item]}`);

    const pages = [];

    if (inventoryItems.length > 0) {
      // Divide the inventory items into pages
      for (let i = 0; i < inventoryItems.length; i += 5) {
        pages.push(inventoryItems.slice(i, i + 5));
      }
    }
    
    // Set up the initial page
    let currentPage = 0;
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle(`${user.username}'s Inventory`)
      .setDescription(pages[currentPage].join('\n'));

    // Add pagination buttons
    const previousButton = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('Previous')
      .setStyle('Primary')
      .setDisabled(true);
    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next')
      .setStyle('Primary')
      .setDisabled(pages.length === 1);
    const actionRow = new ActionRowBuilder().addComponents(previousButton, nextButton);
    const filter = i => i.customId === 'previous' || i.customId === 'next';

    const message = await interaction.reply({ embeds: [embed], components: [actionRow] });

    const collector = message.createMessageComponentCollector({ filter, time: 60000 });
    collector.on('collect', async i => {
      if (i.customId === 'previous') {
        currentPage--;
      } else if (i.customId === 'next') {
        currentPage++;
      }
      if (currentPage === 0) {
        previousButton.setDisabled(true);
      } else {
        previousButton.setDisabled(false);
      }
      if (currentPage === pages.length - 1) {
        nextButton.setDisabled(true);
      } else {
        nextButton.setDisabled(false);
      }
      if (pages[currentPage]) {
        embed.setDescription(pages[currentPage].join('\n'));
      }
      await i.update({ embeds: [embed], components: [actionRow] });
    });
  }
};
