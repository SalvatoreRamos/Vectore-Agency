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
    const secret = process.env.JWT_SECRET || '81c69871012f9818750a4d11b475b5f3';
    return jwt.sign(
        { userId },
        secret,
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

        // Auto-sync or create admin based on environment variables
        const envEmail = process.env.ADMIN_EMAIL;
        const envPass = process.env.ADMIN_PASSWORD;

        // Log for debugging
        console.log(`Login attempt for: ${email}`);

        if (envEmail && envPass && email === envEmail && password === envPass) {
            if (!user) {
                console.log("Admin not found, creating one...");
                user = new User({
                    email: envEmail,
                    password: envPass,
                    name: 'Administrator',
                    role: 'admin'
                });
                await user.save();
            } else {
                // Defensive check to avoid Bcrypt error if password is missing in DB
                let isMatch = false;
                if (user.password) {
                    try {
                        isMatch = await user.comparePassword(password);
                    } catch (e) {
                        console.log("Bcrypt comparison failed, syncing...");
                    }
                }

                if (!isMatch) {
                    console.log("Password mismatch or missing in DB, syncing with .env...");
                    user.password = password;
                    user.role = 'admin';
                    await user.save();
                }
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'La cuenta está desactivada' });
        }

        // Final check with error protection
        try {
            if (!user.password) throw new Error("Missing password in DB");
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }
        } catch (error) {
            console.error("Auth error:", error.message);
            return res.status(401).json({ success: false, message: 'Fallo de autenticación (credenciales inválidas o corruptas)' });
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
        console.error('Login error detail:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno en el servidor',
            error: error.message
        });
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

// @route   POST /api/auth/google
// @desc    Login/Register via Google Sign-In
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                avatar: picture,
                role: 'user',
                isActive: true
            });
            await user.save();
        } else {
            // Update Google info if needed
            if (!user.googleId) user.googleId = googleId;
            if (picture) user.avatar = picture;
            user.lastLogin = new Date();
            await user.save();
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar || picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Error al autenticar con Google',
            error: error.message
        });
    }
});

export default router;
