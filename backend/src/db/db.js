const mongoose = require('mongoose');


async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
        
    }catch(err) {
        console.log("MongoDb error: ", err);
        
    }
}

module.exports = connectDb;