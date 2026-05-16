import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});

        if (user) {
            return res.json({success: false, message: "Account Already Exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })

        const token = generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message:"Account created successfully"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
} 

// Controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        // ✅ Return sanitized user object
        res.json({
            success: true,
            message: "Login successful",
            token,
            userData: {
                _id: user._id,              // ⚠️ Needed by frontend
                fullName: user.fullName,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic || null
            }
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

// Controller to update usee profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updateduser;

        if (!profilePic) {
            updateduser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updateduser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({ success: true, user: updateduser})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}