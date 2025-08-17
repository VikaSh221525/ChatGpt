const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email })

    if (isUserAlreadyExists) {
        res.status(400).json({ message: "user already exists" })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create(
        {
            fullName: {
                firstName, lastName
            },
            email,
            password: hashPassword
        }
    )
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token)
    res.status(201).json({
        message: "User registered successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })
    if (!user) {
        res.status(400).json({ message: "User not found" })
    }

    const isPasswordvalid = await bcrypt.compare(password, user.password);
    if (!isPasswordvalid) {
        res.status(400).json({ message: "Incorrect password" })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(200).json({
        message: "Login successfull",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
}

module.exports = { registerUser, loginUser }