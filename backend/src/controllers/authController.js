const bcrypt = require("bcryptjs")
const User = require("../models/User")
const generateToken = require("../utils/generateToken")

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email, and password" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? "Email already registered" : "Username already taken",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || "",
    })

    const savedUser = await user.save()

    // Generate token
    const token = generateToken(savedUser._id)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        profilePicture: savedUser.profilePicture,
        isVerified: savedUser.isVerified,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}

// Get current user
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePicture: req.user.profilePicture,
        bio: req.user.bio,
        location: req.user.location,
        skills: req.user.skills,
        interests: req.user.interests,
        socialLinks: req.user.socialLinks,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get me error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const allowedUpdates = [
      "firstName",
      "lastName",
      "bio",
      "location",
      "skills",
      "interests",
      "socialLinks",
      "profilePicture",
    ]
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" })
    }

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        skills: user.skills,
        interests: user.interests,
        socialLinks: user.socialLinks,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error during profile update" })
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
}
