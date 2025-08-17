const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");


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
            socket.user = decode
            next()

        }catch(err) {
            next(new Error("Invalid token"))
            
        }

        
    })

    io.on("connection", (socket) => {
        console.log("new socket connection: ", socket.id);
        
    })
}

module.exports = initSocketServer