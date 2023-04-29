const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
  } = require("discord.js");
  const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
  
  module.exports = {
    config: {
      name: "advice",
      category: "Community",
      description: `Get some random advice`,
      usage: "advice",
      type: "slash", // or "slash"
      cooldown: 5
  },
    data: new SlashCommandBuilder()
      .setName("advice")
      .setDescription("Get random advice."),
    async execute(interaction) {
      const data = await fetch("https://api.adviceslip.com/advice").then((res) =>
        res.json()
      );
      
      const embed = new EmbedBuilder()
      .setTimestamp()
      .setThumbnail('https://cdn.discordapp.com/avatars/1082544311431860254/10e13c74c439f3c7bfc156e9b49f83f7.png')
      .setTitle('> Advice Given')
      .setFooter({ text: `🤝 Advice Fetched`})
      .setAuthor({ name: `🤝 Advice Randomizer`})
      .addFields({ name: `• Advice`, value: `> ${data.slip.advice}`})
      .setColor("DarkBlue")

      await interaction.reply({embeds: [embed]});
    },
  };
  