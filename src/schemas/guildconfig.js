const { model, Schema} = require('mongoose')

let guildConfigSchema = new Schema({
    guildId: { type: String, required: true },
    logChannelId: { type: String, required: true },
    enabledLogs: { type: [String], required: true }
});

module.exports = model("guildConfig", guildConfigSchema);