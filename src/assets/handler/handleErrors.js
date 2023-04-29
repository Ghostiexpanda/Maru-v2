const { botErrors } = require("./handleWebhook");

module.exports = {
    disconnect: () => {
        console.log("Bot disconnected from Discord".red);
    },
    reconnecting: () => {
        console.log("Bot is reconnecting to Discord".red);
    },
    warn: (err) => {
        console.warn(`[WARN]: ${err}`.red);
    },
    error: (err) => {
        console.error(`[ERROR]: ${err}`.red);
        const errorMessage = err.message || "Unknown error occurred.";
        const stackTrace = err.stack || "No stack trace available.";
        botErrors("Error", errorMessage, stackTrace);
    },
    DiscordAPIError: (err) => {
        console.error(`[DiscordAPIError]: ${err.message}`.red);
    },

}