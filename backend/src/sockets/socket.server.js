const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse } = require("../services/ai.service");
const { messageModel } = require("../models/message.model");

function initSocketServer(httpServer){
    const io = new Server(httpServer, {})

    //socketio middleware
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
        // console.log("socket connection cookies:", cookies);
        if(!cookies.token){
            next(new Error("Authentication Error: No token provided"))
        }
        try{
            const decode = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decode.id)
            socket.user = user
            next()

        }catch(err) {
            next(new Error("Invalid token"))
            
        }
    })

    io.on("connection", (socket) => {
        socket.on("ai-message", async (messagePayload) => {
            console.log("AI message recieved: ", messagePayload); //messagepayload=> chatID, content

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const response = await generateResponse(messagePayload.content);

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })
            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            })
        })
    })

}

module.exports = initSocketServer