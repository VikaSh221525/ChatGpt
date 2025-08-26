const chatModel = require("../models/chat.model");
const { messageModel } = require("../models/message.model");

async function createChat(req, res) {
    try {
        const { title } = req.body;
        const user = req.user;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                message: "Title is required and cannot be empty"
            });
        }

        const chat = await chatModel.create({
            user: user._id,
            title: title.trim()
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity,
                user: chat.user
            }
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({
            message: "Internal server error while creating chat"
        });
    }
}

async function getChats(req, res){
    const user = req.user;

    const chats = await chatModel.find({user: user._id});

    res.status(200).json({
        message:"Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    })
}

async function getMessages(req, res){
    const chatId = req.params.id;
    const messages = await messageModel.find({chat: chatId}).sort({createdAt:1});

    res.status(200).json({
        message: "Message retreived successfully",
        messages: messages
    })
}

module.exports = { createChat, getChats, getMessages }