import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/contact
// @desc    Send a contact email
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Por favor completa los campos obligatorios (nombre, email y mensaje).'
        });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
        subject: `Nuevo mensaje de contacto de ${name} - ${service || 'General'}`,
        replyTo: email,
        text: `
            Has recibido un nuevo mensaje desde el formulario de contacto de Vectore:

            Nombre: ${name}
            Email: ${email}
            Servicio de interés: ${service || 'No especificado'}
            
            Mensaje:
            ${message}
        `,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Servicio de interés:</strong> ${service || 'No especificado'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Mensaje:</strong></p>
                <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    ${message.replace(/\n/g, '<br>')}
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Hubo un error al enviar el mensaje. Por favor intenta más tarde o contáctanos por WhatsApp.'
        });
    }
});

export default router;
