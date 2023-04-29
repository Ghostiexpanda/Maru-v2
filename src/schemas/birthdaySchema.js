const { model, Schema } = require('mongoose');

const birthdaySchema = new Schema({
    guildId: String,
    userId: String,
    birthday: Date,
});

module.exports = model('Birthday', birthdaySchema);