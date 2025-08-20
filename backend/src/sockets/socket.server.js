const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { messageModel } = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

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
            // console.log("AI message recieved: ", messagePayload);
            //messagepayload=> chatID, content

            const message = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const vectors = await generateVector(messagePayload.content);

            const memory = await queryMemory(
                {
                    queryVector : vectors,
                    limit : 3,
                    metadata:{}
                }
            )

            // console.log("vectorsGenerated: ", vectors);
            await createMemory({
                vectors,
                messageId: message._id,
                metadata:{
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })

            console.log("Memory: ", memory);
            

            // chat history => shortterm memory
            const chatHistory = await messageModel.find({
                chat: messagePayload.chat
            })

            
            const response = await generateResponse(chatHistory.map(item => {
                return{
                    role: item.role,
                    parts: [{text : item.content}]
                }
            }));

            // console.log("chatHistory: ", chatHistory.map(item => {
            //     return{
            //         role: item.role,
            //         parts: [{text : item.content}]
            //     }
            // }));

            const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })

            const responseVectors = await generateVector(response);

            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata:{
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            })

            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            })
        })
    })

}

module.exports = initSocketServer