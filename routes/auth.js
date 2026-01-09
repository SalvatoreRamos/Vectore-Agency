import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @route   POST /api/auth/login
// @desc    Login user (Admin only for dashboard)
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        let user = await User.findOne({ email });

        // Auto-create admin if it doesn't exist and matches env credentials
        if (!user && (email === process.env.ADMIN_EMAIL || email === 'admin@vectore.com')) {
            const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
            // Only create if password also matches (simple fallback check)
            // But usually we just want to ensure at least one admin exists.
            // Let's create it and then continue to the password comparison.
            user = new User({
                email: email,
                password: adminPass,
                name: 'Administrator',
                role: 'admin'
            });
            await user.save();
            console.log(`System: Admin user created automatically for ${email}`);
        }

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current session user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

export default router;
