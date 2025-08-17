const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'chatgptusers',
        required: true
    },
    title:{
        type: String,
        required: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})

const chatModel = mongoose.model("userChat", chatSchema);

module.exports = chatModel;