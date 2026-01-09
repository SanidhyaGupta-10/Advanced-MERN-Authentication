import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { senderVerificationEmail, sendWelcomeEmail } from '../mailtrap/email.js';


const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        // Create a new user

        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hour 
        });
        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await senderVerificationEmail(email, verificationToken);

        // Set the token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        // Respond with success message
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                ...user._doc,

            },
        });

        console.log(req.body);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error try again later..' });
        console.log(error);
    }

}

const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }

}


const login = async (req, res) => {
    // Login logic here
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    // Logout logic here (if using sessions or token blacklisting)
    res.status(200).json({ message: 'Logout successful' });
}

export default {
    register,
    verifyEmail,
    login,
    logout
};

