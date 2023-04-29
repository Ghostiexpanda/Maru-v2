const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

module.exports = {
  config: {
    name: "shop",
    category: "Economy",
    description: `Buy items`,
    usage: "shop",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Buy items from the shop.')
    .addStringOption(option => option.setName('item').setDescription('The item you want to buy.').setRequired(true))
    .addIntegerOption(option => option.setName('quantity').setDescription('The quantity you want to buy.').setRequired(true)),

    async execute(interaction) {
      const { options, user, guild } = interaction;
      const itemName = options.getString('item');
      const quantity = options.getInteger('quantity');
    
      let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
      if (!userData) {
        return await interaction.reply({
          content: 'You do not have an account!',
          ephemeral: true
        });
      }
    
      // Define the items in the shop
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
    
      // Find the item the user wants to buy in the shop
      const item = shopItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!item) {
        return await interaction.reply({
          content: 'That item is not available in the shop!',
          ephemeral: true
        });
      }
    
      // Calculate the total price for the requested quantity
      const totalPrice = item.price * quantity;
      if (userData.Wallet < totalPrice) {
        return await interaction.reply({
          content: 'You do not have enough money to buy this item!',
          ephemeral: true
        });
      }
    
      // Update the user's wallet and inventory, and save the changes to the database
      userData.Wallet -= totalPrice;
      if (!userData.Inventory) {
        userData.Inventory = [];
      }
      for (let i = 0; i < quantity; i++) {
        userData.Inventory.push(item.name);
      }
      await userData.save();
    
      // Create and send an embed message to confirm the purchase
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`You bought ${quantity} ${item.name}(s) for $${totalPrice}!`)
        .setDescription(item.description);
      await interaction.reply({ embeds: [embed] });
    }
  };    
