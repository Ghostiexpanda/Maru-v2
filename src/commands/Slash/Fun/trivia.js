const { SlashCommandBuilder } = require("@discordjs/builders");
const { Trivia } = require("discord-gamecord");

module.exports = {
  config: {
    name: "trivia",
    category: "Fun",
    description: "Play some trivia",
    usage: "trivia",
    type: "slash", // or "slash"
    cooldown: 1
},
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Play a trivia game!"),
  async execute(interaction) {
    const Game = new Trivia({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Trivia",
        color: "#5865F2",
        description: "You have 60 seconds to guess the answer.",
      },
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      trueButtonStyle: "SUCCESS",
      falseButtonStyle: "DANGER",
      mode: "multiple", // multiple || single
      difficulty: "medium", // easy || medium || hard
      winMessage: "You won! The correct answer is {answer}.",
      loseMessage: "You lost! The correct answer is {answer}.",
      errMessage: "Unable to fetch question data! Please try again.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
  return;
    });
  },
};
