const { model, Schema } = require('mongoose');

let voteSchema = new Schema({
    userId: String,
    lastVoted: Date
});

module.exports = model('voteSchema', voteSchema);
