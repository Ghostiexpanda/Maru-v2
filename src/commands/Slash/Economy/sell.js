const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
  config: {
    name: "sell",
    category: "Economy",
    description: `Sell items`,
    usage: "sell",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item from your inventory.')
    .addStringOption(option => option.setName('item').setDescription('The item you want to sell.').setRequired(true))
    .addIntegerOption(option => option.setName('quantity').setDescription('The quantity you want to sell.').setRequired(true)),

    async execute(interaction) {
        const { options, user, guild } = interaction;
        const itemName = options.getString('item').toLowerCase(); // Convert to lowercase
        const quantity = options.getInteger('quantity');
      
        let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
        if (!userData || !userData.Inventory || userData.Inventory.length === 0) {
          return await interaction.reply({
            content: 'You do not have any items to sell!',
            ephemeral: true
          });
        }
      
        // Find the item the user wants to sell in their inventory (case-insensitive)
        const itemIndex = userData.Inventory.findIndex(i => i.toLowerCase() === itemName);
        if (itemIndex === -1) {
          return await interaction.reply({
            content: 'You do not have that item in your inventory!',
            ephemeral: true
          });
        }
      
        // Check if the user has enough of the item to sell (case-insensitive)
        const numOwned = userData.Inventory.filter(i => i.toLowerCase() === itemName).length;
        if (numOwned < quantity) {
          return await interaction.reply({
            content: `You only have ${numOwned} ${itemName}(s) in your inventory!`,
            ephemeral: true
          });
        }
      
        // Define the sell prices for each item
        const sellPrices = {
          'fishing rod': 25,
          'hunting rifle': 50,
          'shovel': 75,
          'egirls cat ears': 100,
          'e-girl': 500,
          'bear': 1000,
          'deer': 500,
          'rabbit': 250,
          'egirls cat tail': 150,
          'gold nugget': 350,
          'diamond': 500,
          'ruby': 750,
          'small fish': 75,
          'big fish': 100,
          'shark': 250,
          'seaweed': 10
          // Add more items and prices here
        };
      
        // Calculate the total sell price for the requested quantity
        const sellPrice = sellPrices[itemName] || 0;
        const totalSellPrice = sellPrice * quantity;
      
        // Update the user's wallet and inventory, and save the changes to the database
        userData.Wallet += totalSellPrice;
        userData.Inventory.splice(itemIndex, quantity);
        await userData.save();
      
        // Create and send an embed message to confirm the sale
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle(`You sold ${quantity} ${itemName}(s) for $${totalSellPrice}!`)
          .setDescription(`You now have $${userData.Wallet}.`);
        await interaction.reply({ embeds: [embed] });
      }
    };      
