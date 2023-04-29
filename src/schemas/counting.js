const { model, Schema } = require('mongoose');
 
let countschema = new Schema ({
    Guild: String,
    Channel: String,
    LastUser: String,
    Count: Number
})
 
module.exports = model('countschema', countschema);