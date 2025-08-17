const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');


async function authUser(req, res, next) {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id)

        req.user = user;

        next();

    }catch(err){
        console.log("Unauthorized", err);
        return res.status(401).json({message: "Invalid or expired token"});
    }
}


module.exports = {authUser}