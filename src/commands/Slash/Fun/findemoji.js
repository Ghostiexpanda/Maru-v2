const { FindEmoji } = require("discord-gamecord");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    config: {
        name: "findemoji",
        category: "Fun",
        description: "memorize the emoji and find it",
        usage: "findemoji",
        type: "slash", // or "slash"
        cooldown: 1
    },
  data: new SlashCommandBuilder()
    .setName("findemoji")
    .setDescription("Find the emoji that matches the description!"),

  async execute(interaction) {
    const Game = new FindEmoji({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Find Emoji",
        color: "#5865F2",
        description: "Remember the emojis from the board below.",
        findDescription: "Find the {emoji} emoji before the time runs out.",
      },
      timeoutTime: 60000,
      hideEmojiTime: 5000,
      buttonStyle: "PRIMARY",
      emojis: ["🍉", "🍇", "🍊", "🍋", "🍌", "🍍", "🍎", "🍏"],
      winMessage: "You won! You selected the correct emoji. {emoji}",
      loseMessage: "You lost! You selected the wrong emoji. {emoji}",
      timeoutMessage: "You lost! You ran out of time. The emoji is {emoji}",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
