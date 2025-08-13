const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


async function getRegisterController(req, res) {
    res.render('register')
}

async function postRegisterController(req, res) {
    const { username, email, password } = req.body;

    // check if user exist ($or condition to find bot username and email)
    const isUserExist = await userModel.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });
    if (isUserExist) {
        res.status(400).json(
            {
                message: "User already exist, With this email or username"
            }
        )
    }

    // if user not exist than create one
    const user = await userModel.create(
        {
            username: username,
            email: email,
            password: await bcrypt.hash(password, 10)
        }
    )

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.cookie("token", token);
    return res.status(201).json(
        {
            message: "user created successfully",
            user
        }
    )

}

async function getLoginController(req, res) {
    res.render('login')
}

async function postLoginController(req, res) {
    const { identifier, password } = req.body; // identifier can be username or email

    try {
        // Find user by either username or email
        const user = await userModel.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            res.status(401).json({message: "Invalid Password"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.cookie("token", token);
        
        return res.status(200).json({
            message: "Login Successfull",
            user: user
        })

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}



module.exports = { getRegisterController, postRegisterController, getLoginController, postLoginController }