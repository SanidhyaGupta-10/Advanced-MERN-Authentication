import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const register = async (req, res) => {
    try{
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const User = new User({ username, email, password: hashedPassword });
        await User.save();
        res.status(201).json({ 
            message: 'User registered successfully' ,
            user: { id: User._id, username: User.username, email: User.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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
    // Logout logic here (if using sessions or token blacklisting)
    res.status(200).json({ message: 'Logout successful' });
}

export default { register, login, logout };