const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { messageModel } = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors:{
            origin: "http://localhost:5173",
            credentials:true
        }
    })

    //socketio middleware
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
        // console.log("socket connection cookies:", cookies);
        if (!cookies.token) {
            next(new Error("Authentication Error: No token provided"))
        }
        try {
            const decode = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decode.id)
            socket.user = user
            next()

        } catch (err) {
            next(new Error("Invalid token"))

        }
    })

    io.on("connection", (socket) => {
        console.log("User Connected");
        
        socket.on("ai-message", async (messagePayload) => {
            // console.log("AI message recieved: ", messagePayload);
            //messagepayload=> chatID, content

            // saving message in db and generating vector at same time
            try {
                const [message, vectors] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: messagePayload.content,
                        role: "user"
                    }),
                    generateVector(messagePayload.content)
                ])

                await createMemory({
                    vectors,
                    messageId: message._id,
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        text: messagePayload.content
                    }
                })

                const [memory, recentMessages] = await Promise.all([
                    queryMemory(
                        {
                            queryVector: vectors,
                            limit: 3,
                            metadata: {
                                user: socket.user._id
                            }
                        }
                    ),
                    messageModel.find({
                        chat: messagePayload.chat
                    }).sort({ createdAt: -1 }).limit(20).lean()
                ])

                const chatHistory = recentMessages.reverse()


                // console.log("Memory: ", memory);

                // chat history => shortterm memory

                const stm = chatHistory.map(item => {
                    return {
                        role: item.role,
                        parts: [{ text: item.content }]
                    }
                })

                const ltmContext = memory.map(item => item.metadata.text).join('\n');

                // console.log("Final prompt being sent to AI:", JSON.stringify(finalPrompt, null, 2));

                const finalPrompt = [...stm];
                const systemInstruction = `<|context|>
                                            Here is some relevant information from past conversations:
                                            ${ltmContext}
                                            <|/context|>

                                            <|conversation|>`;  

                if (finalPrompt.length > 0 && finalPrompt[0].role === 'user') {
                    finalPrompt[0].parts[0].text = `${systemInstruction}\n${finalPrompt[0].parts[0].text}`;
                } else {
                    finalPrompt.unshift({ role: 'user', parts: [{ text: systemInstruction }] });
                }

                const anolaPersona = `You are Anola, a friendly and highly intelligent AI assistant 🤖. Your goal is to provide clear, accurate, and helpful responses. Be polite, professional, and use emojis where appropriate to make the conversation feel more engaging and natural 👍. You are to follow all user instructions precisely.`

                const response = await generateResponse(finalPrompt, anolaPersona)

                socket.emit('ai-response', {
                    content: response,
                    chat: messagePayload.chat
                })

                const [responseMessage, responseVectors] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    generateVector(response)
                ])

                await createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id,
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        text: response
                    }
                })

            } catch (err) {
                console.error("Error processing AI message:", err);
                socket.emit('ai-error', { message: "An error occurred." });
            }
        })
    })
}

module.exports = initSocketServer