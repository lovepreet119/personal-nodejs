const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

module.exports = mongoose.model(
    'users', // name of collection in database
    userSchema // name of schema to be used
)