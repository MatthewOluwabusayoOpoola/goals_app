const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  //   check if the user exist

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exist");
  }

  // Hash password
  const salt = await bycrypt.genSalt(10);
  const hashedpassword = await bycrypt.hash(password, salt);

  // Create User
  const user = await User.create({
    name,
    email,
    password: hashedpassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
  //   res.status(200).json({ message: "Register User" });
});

// @desc authenticate a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check for user email
  const user = await User.findOne({ email });

  if (user && (await bycrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
  //   res.status(200).json({ message: "login User" });
});

// @desc Get user data
// @route GET /api/users
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
  //   res.status(200).json({ message: "User Data" });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
