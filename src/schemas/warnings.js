const { model, Schema } = require('mongoose');

const warningSchema = new Schema({
  User: {
    type: String,
    required: true
  },
  Guild: {
    type: String,
    required: true
  },
  Warnings: [{
    warn_id: Number,
    moderator_id: String,
    reason: String,
    timestamp: Date
  }]
});

module.exports = model('Warning', warningSchema);
