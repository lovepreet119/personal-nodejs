const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema({
    username: String,
    balance: String,
})

module.exports = mongoose.model(
    'wallet',
    walletSchema
)