const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chatgptusers'
    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userchats'
    },
    content:{
        type:String,
        required: true
    },
    role:{
        type: String,
        enum: ["user", "model"],
        default: "user"
    }
}, {timestamps:true} )

const messageModel = mongoose.model("messages", messageSchema);

module.exports = {messageModel}
