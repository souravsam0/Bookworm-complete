import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// In-memory OTP storage (in production, consider using Redis or a database)
const otpStore = {};

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d"});
}

// Request OTP endpoint
router.post("/request-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }
        
        // Normalize phone number to remove any spaces, dashes, or parentheses
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

        // Generate a 6-digit OTP
        // const otp = Array(6).fill(0).map(() => 
        //     Math.floor(Math.random() * 10)
        // ).join('');

        const otp = 476942

        // Store OTP with expiry (5 minutes)
        otpStore[normalizedPhone] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes in milliseconds
        };

        // Log for debugging
        console.log(`OTP generated for ${normalizedPhone}: ${otp}`);
        console.log(`OTP store after generation:`, otpStore);

        // Check if user exists
        let user = await User.findOne({ phoneNumber: normalizedPhone });

        res.status(200).json({ 
            message: "OTP sent successfully",
            isNewUser: !user
        });

    } catch (error) {
        console.log("Error in request-otp route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        // Normalize phone number to match the format used in request-otp
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
        
        console.log(`Verifying OTP for ${normalizedPhone}: ${otp}`);
        console.log(`Current OTP store:`, otpStore);

        // Check if OTP exists and is valid
        const otpData = otpStore[normalizedPhone];
        if (!otpData) {
            console.log(`No OTP found for ${normalizedPhone}`);
            return res.status(400).json({ message: "Invalid OTP or phone number" });
        }
        
        if (otpData.otp.toString() !== otp.toString()) {
            console.log(`OTP mismatch. Expected: ${otpData.otp}, Received: ${otp}`);
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (Date.now() > otpData.expiresAt) {
            console.log(`OTP expired for ${normalizedPhone}`);
            delete otpStore[normalizedPhone]; // Clear expired OTP
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Clear OTP after successful verification
        delete otpStore[normalizedPhone];
        console.log(`OTP verified and cleared for ${normalizedPhone}`);

        // Find or create user with normalized phone number
        let user = await User.findOne({ phoneNumber: normalizedPhone });
        
        if (!user) {
            // Create a new user with phone number
            let username;

            if (normalizedPhone === process.env.HIM_PHONE) {
                username = process.env.HIM_USERNAME;
            } else if (normalizedPhone === process.env.HER_PHONE) {
                username = process.env.HER_USERNAME;
            } else {
                username = `user_${Date.now().toString().slice(-6)}`;
            }

            const profileImage = `https://api.dicebear.com/9.x/personas/svg?seed=${username}`;
            
            user = new User({
                phoneNumber: normalizedPhone,
                username,
                profileImage,
                // Generate a random password for the user
                password: Math.random().toString(36).slice(-8),
            });
            
            await user.save();
            console.log(`New user created with phone ${normalizedPhone}`);
        }

        // Generate token
        const token = generateToken(user._id);
        console.log(`JWT token generated for user ${user._id}`);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            }
        });

    } catch (error) {
        console.log("Error in verify-otp route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;