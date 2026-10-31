import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import sendEmail from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || '81c69871012f9818750a4d11b475b5f3';
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        secret,
        { expiresIn: '7d' }
    );
};

// @route   POST /api/auth/login
// @desc    Login user (Admin Dashboard, Corporate Client Hub & Vectore Flow SSO)
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Ingrese un correo corporativo válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const email = req.body.email.trim().toLowerCase();
        const { password } = req.body;
        let user = await User.findOne({ email });

        const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const envPass = process.env.ADMIN_PASSWORD;

        if (envEmail && envPass && email === envEmail && password === envPass) {
            if (!user) {
                user = new User({
                    email: envEmail,
                    password: envPass,
                    name: 'Administrator',
                    role: 'admin',
                    isVerified: true
                });
                await user.save();
            } else {
                let isMatch = false;
                if (user.password) {
                    try {
                        isMatch = await user.comparePassword(password);
                    } catch (e) {
                        isMatch = false;
                    }
                }
                if (!isMatch) {
                    user.password = password;
                    user.role = 'admin';
                    user.isVerified = true;
                    await user.save();
                } else if (!user.isVerified) {
                    user.isVerified = true;
                    await user.save();
                }
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Cuenta no encontrada. Si eres cliente corporativo, inicia sesión con Google.' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Esta cuenta corporativa se encuentra inactiva.' });
        }

        if (!user.isVerified) {
            if (user.googleId || user.email === envEmail) {
                user.isVerified = true;
                await user.save();
            } else {
                return res.status(401).json({ success: false, message: 'Verifica tu correo electrónico antes de continuar.' });
            }
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Esta cuenta está vinculada a Google Workspace. Usa el botón Continuar con Google.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar || '',
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno en el servidor de autenticación'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Validate active JWT session (also serves as SSO identity check for Vectore Flow)
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            avatar: req.user.avatar || '',
            role: req.user.role
        }
    });
});

// @route   POST /api/auth/google
// @desc    One-click Google Sign-In for Corporate Client Portal & Vectore Flow SSO
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Credencial de Google requerida' });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email: rawEmail, name, picture } = payload;
        const email = (rawEmail || '').toLowerCase().trim();
        const envEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                avatar: picture,
                role: email === envEmail ? 'admin' : 'user',
                isActive: true,
                isVerified: true
            });
            await user.save();
        } else {
            if (!user.googleId) user.googleId = googleId;
            if (picture) user.avatar = picture;
            if (email === envEmail && user.role !== 'admin') user.role = 'admin';
            user.isVerified = true;
            user.lastLogin = new Date();
            await user.save();
        }

        const token = generateToken(user);

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
            message: 'No se pudo verificar la identidad con Google',
            error: error.message
        });
    }
});

// @route   POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
    try {
        const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No hay cuenta asociada a este correo.' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const host = req.get('host');
        const protocol = req.protocol === 'http' && host.includes('localhost') ? 'http' : 'https';
        const resetUrl = `${protocol}://${host}/reset-password.html?token=${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Restablecimiento de Acceso Corporativo — Agencia Vectore',
            message: `
                <div style="font-family: Inter, Arial, sans-serif; padding: 20px;">
                    <h2>Restablecer Contraseña</h2>
                    <p>Haz clic en el siguiente botón para actualizar tu contraseña del Área de Clientes / Vectore:</p>
                    <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#8655FF; color:#fff; text-decoration:none; border-radius:8px;">Actualizar Contraseña</a>
                </div>
            `
        });

        res.status(200).json({ success: true, message: 'Enlace enviado a tu correo corporativo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo de recuperación.' });
    }
});

// @route   PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'El enlace es inválido o ha expirado.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user);
        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al restablecer la contraseña.' });
    }
});

export default router;
