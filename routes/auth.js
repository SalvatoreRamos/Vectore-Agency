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
                        console.log("Bcrypt comparison failed, syncing...");
                    }
                }
                if (!isMatch) {
                    console.log("Password mismatch or missing in DB, syncing with .env...");
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

        // Test credentials for Culqi Review
        if (email === 'test@culqi.com' && password === 'culqi123') {
            if (!user) {
                console.log("Creando usuario de prueba Culqi...");
                user = new User({
                    email: 'test@culqi.com',
                    password: 'culqi123',
                    name: 'Usuario de Prueba (Culqi)',
                    role: 'user',
                    isVerified: true
                });
                await user.save();
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'La cuenta está desactivada' });
        }

        // Handle verification: admins, Google users, and Culqi test are auto-verified
        if (!user.isVerified) {
            if (user.googleId || user.email === envEmail || user.email === 'test@culqi.com') {
                user.isVerified = true;
                await user.save();
            } else {
                return res.status(401).json({ success: false, message: 'Por favor verifica tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.' });
            }
        }

        // Final password check with error protection
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
                isActive: true,
                isVerified: true
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

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Por favor ingrese un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        user = new User({
            name,
            email,
            password,
            role: 'user',
            isVerified: false
        });

        const verificationToken = user.getVerificationToken();
        await user.save();

        const host = req.get('host');
        const protocol = req.protocol === 'http' && host.includes('localhost') ? 'http' : 'https';
        const verifyUrl = `${protocol}://${host}/api/auth/verifyemail/${verificationToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #160F50;">Verifica tu cuenta en Vectore</h2>
                <p>Hola ${name}, gracias por registrarte en nuestra agencia digital.</p>
                <p>Por favor haz clic en el siguiente botón para verificar tu correo y poder iniciar sesión:</p>
                <a href="${verifyUrl}" style="display:inline-block; margin: 15px 0; padding:12px 24px; background:#8655FF; color:#fff; text-decoration:none; border-radius:8px; font-weight: bold;">Verificar mi correo</a>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">Si no fuiste tú, simplemente ignora este correo.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verifica tu correo electrónico - Vectore',
                message
            });

            res.status(201).json({
                success: true,
                message: 'Cuenta creada exitosamente. Se ha enviado un correo con el enlace de verificación.'
            });
        } catch (error) {
            console.error('Error enviando correo de verificación:', error);
            await user.deleteOne(); // Borrar el usuario si no se puede enviar el email
            return res.status(500).json({ success: false, message: 'No se pudo enviar el correo de verificación. Inténtalo de nuevo más tarde.' });
        }

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Error interno en el servidor' });
    }
});

// @route   GET /api/auth/verifyemail/:token
// @desc    Verify user email
// @access  Public
router.get('/verifyemail/:token', async (req, res) => {
    try {
        const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ emailVerificationToken });

        if (!user) {
            return res.status(400).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #dc3545;">Enlace inválido o expirado</h2>
                        <p>El enlace de verificación no es válido o ya fue utilizado.</p>
                        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #8655FF; color: white; text-decoration: none; border-radius: 5px;">Ir al inicio</a>
                    </body>
                </html>
            `);
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.status(200).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #25D366;">¡Cuenta verificada exitosamente!</h2>
                    <p>Tu correo ha sido verificado. Ya puedes iniciar sesión y continuar con tus compras o solicitudes.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #8655FF; color: white; text-decoration: none; border-radius: 5px;">Ir a la tienda</a>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).send('Error interno en el servidor');
    }
});

// @route   POST /api/auth/forgotpassword
// @desc    Send password reset email
// @access  Public
router.post('/forgotpassword', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No hay usuario registrado con ese correo' });
        }

        // Si es un usuario que solo de registró con Google (y no tiene password set), no debería resetear. Pero lo permitiremos para que fije una constraseña.
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Crear reset url (En un entorno real, debe ser HTTPS y usar la URL del front)
        const host = req.get('host');
        const protocol = req.protocol === 'http' && host.includes('localhost') ? 'http' : 'https';
        const resetUrl = `${protocol}://${host}/reset-password.html?token=${resetToken}`;

        const message = `
            <h2>Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña para Vectore Agency. Por favor haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#8655FF; color:#fff; text-decoration:none; border-radius:5px;">Restablecer Contraseña</a>
            <p>Si no solicitaste esto, ignora este correo.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Restablecimiento de Contraseña - Vectore',
                message
            });

            res.status(200).json({ success: true, message: 'Correo enviado. Revisa tu bandeja de entrada.' });
        } catch (error) {
            console.error('Error enviando correo:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Error interno de servidor' });
    }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'El token es inválido o ha expirado' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Error al restablecer la contraseña' });
    }
});

export default router;
