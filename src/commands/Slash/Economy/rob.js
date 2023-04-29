const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ecoSchema = require('../../../schemas/ecoSchema.js');

const timeout = new Set();

module.exports = {
  config: {
    name: "rob",
    category: "Economy",
    description: `Robs a user`,
    usage: "rob",
    type: "slash", // or "slash"
    cooldown: 5
},
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Rob a user for money.')
    .addUserOption(option => option.setName('user').setDescription('The user you want to rob.').setRequired(true)),

  async execute(interaction) {
    const { options, user, guild } = interaction;

    if (timeout.has(user.id)) {
      return await interaction.reply({
        content: 'Wait 1 minute to rob again!',
        ephemeral: true
      });
    }

    const userStealing = options.getUser('user');

    if (userStealing.id === user.id) {
      return await interaction.reply({
        content: 'You cannot rob yourself!',
        ephemeral: true
      });
    }

    let userData = await ecoSchema.findOne({ Guild: guild.id, User: user.id });
    let targetData = await ecoSchema.findOne({ Guild: guild.id, User: userStealing.id });

    if (!userData) {
      return await interaction.reply({
        content: 'You do not have an account!',
        ephemeral: true
      });
    }

    if (!targetData) {
      return await interaction.reply({
        content: 'That user does not have an account!',
        ephemeral: true
      });
    }

    if (targetData.Wallet <= 0) {
      return await interaction.reply({
        content: 'That user does not have any money to rob!',
        ephemeral: true
      });
    }

    const positiveChoices = [
      'you stole',
      'you robbed',
      'you took',
      'you got'
    ];

    const negativeChoices = [
      'you got caught',
      'you got caught by the police',
      'you got caught by the FBI',
      'you got caught by the CIA',
      'you failed',
      'your mom caught you',
      'your dad caught you',
      'a bystander called the police',
      'you got caught by the cops and they shot you'
    ];

    const result = Math.random() >= 0.5 ? 'win' : 'lose';
    const amount = Math.floor(Math.random() * 300) + 10;

    let embed;

    if (result === 'win') {
      const action = positiveChoices[Math.floor(Math.random() * positiveChoices.length)];
      embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Robbery successful')
        .setDescription(`${action} $${amount}`)
      userData.Wallet += amount;
      targetData.Wallet -= amount;
    } else {
      const action = negativeChoices[Math.floor(Math.random() * negativeChoices.length)];
      embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Robbery failed')
        .setDescription(`${action}, you lost $${amount}`)
      userData.Wallet -= amount;
      targetData.Wallet += amount;
    }

    await interaction.reply({ embeds: [embed] });

    await userData.save();
    await targetData.save();

    timeout.add(user.id);
    setTimeout(() => {
      timeout.delete(user.id);
    }, 60000);
  }
};
