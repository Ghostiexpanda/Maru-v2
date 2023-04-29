const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const shopItems = [
  {
    name: 'Fishing Rod',
    price: 50,
    description: 'A useful tool for fishing.',
  },
  {
    name: 'Hunting Rifle',
    price: 100,
    description: 'A useful tool for hunting animals.',
  },
  {
    name: 'Shovel',
    price: 150,
    description: 'A useful tool for digging.',
  }
];

const ITEMS_PER_PAGE = 2;

module.exports = {
  config: {
    name: "shopitems",
    category: "Economy",
    description: `Shows the items avalible to buy`,
    usage: "shopitems",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('shopitems')
    .setDescription('View available items in the shop.'),
    
  async execute(interaction) {
    const pages = [];
    let currentPage = 0;

    // Split shop items into pages
    for (let i = 0; i < shopItems.length; i += ITEMS_PER_PAGE) {
      const items = shopItems.slice(i, i + ITEMS_PER_PAGE);
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Shop Items')
        .setDescription(items.map(item => `${item.name} - $${item.price}\n${item.description}`).join('\n\n'));
      pages.push(embed);
    }

    // Create action row with navigation buttons
    const previousButton = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('Previous')
      .setStyle('Secondary');
    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next')
      .setStyle('Primary');
    const navigationRow = new ActionRowBuilder()
      .addComponents(previousButton, nextButton);

    // Send first page
    const message = await interaction.reply({ embeds: [pages[currentPage]], components: [navigationRow] });

    // Set up collector for button interactions
    const filter = i => i.customId === 'previous' || i.customId === 'next';
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    // Handle button interactions
    collector.on('collect', async i => {
      if (i.customId === 'previous') {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId === 'next') {
        currentPage = Math.min(pages.length - 1, currentPage + 1);
      }
      await i.update({ embeds: [pages[currentPage]], components: [navigationRow] });
    });

    // End collector after timeout
    collector.on('end', () => {
      navigationRow.components.forEach(component => component.setDisabled(true));
      message.edit({ components: [navigationRow] });
    });
  }
};
