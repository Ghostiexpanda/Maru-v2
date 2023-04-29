const { model, Schema } = require('mongoose');

let ecoSchema = new Schema({
    Guild: String,
    User: String,
    Bank: Number,
    Inventory: Array,
    lastDaily: Date,
    lastWeekly: Date,
    lastMonthly: Date,
    lastYearly: Date,
    createdAt: { type: Date, default: Date.now },
    Wallet: Number
})

module.exports = model("ecoSchema", ecoSchema);