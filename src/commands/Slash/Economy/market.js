const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const marketItems = [
  {
    name: 'Fishing Rod',
    price: 25,
  },
  {
    name: 'Hunting Rifle',
    price: 50,
  },
  {
    name: 'Shovel',
    price: 75,
  },
  {
    name: 'E-Girls Cat Ears',
    price: 100,
  },
  {
    name: 'E-Girl',
    price: 500,
  },
  {
    name: 'Bear',
    price: 1000,
  },
  {
    name: 'Deer',
    price: 500,
  },
  {
    name: 'Rabbit',
    price: 250,
  },
  {
    name: 'E-Girls Cat Tail',
    price: 150,
  },
  {
    name: 'Gold Nugget',
    price: 350,
  },
  {
    name: 'Diamond',
    price: 500,
  },
  {
    name: 'Ruby',
    price: 750,
  },
  {
    name: 'Small Fish',
    price: 75,
  },
  {
    name: 'Big Fish',
    price: 100,
  },
  {
    name: 'Shark',
    price: 250,
  },
  {
    name: 'Seaweed',
    price: 10,
  }
];

const ITEMS_PER_PAGE = 5;

module.exports = {
  config: {
    name: "market",
    category: "Economy",
    description: `Check the avalible items you can sell`,
    usage: "market",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('View available items you can sell.'),
    
  async execute(interaction) {
    const pages = [];
    let currentPage = 0;

    // Split shop items into pages
    for (let i = 0; i < marketItems.length; i += ITEMS_PER_PAGE) {
      const items = marketItems.slice(i, i + ITEMS_PER_PAGE);
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Market')
        .setDescription(items.map(item => `${item.name} - $${item.price}`).join('\n\n'));
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
