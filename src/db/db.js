const mongoose = require('mongoose');

function connectDB(){
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB connected Successfully");
    }).catch((err) => {
        console.log("db is not connected: ", err);
        
    })
}

module.exports = connectDB;