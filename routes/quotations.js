import express from 'express';
import rateLimit from 'express-rate-limit';
import Lead from '../models/Lead.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

const quotationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta red. Por favor escríbenos directamente por WhatsApp.'
    }
});

/**
 * POST /api/quotations
 * Stores B2B Corporate Quotation (WhatsApp Direct or Formal Email Proforma)
 */
router.post('/', quotationLimiter, async (req, res) => {
    try {
        // Invisible honeypot check against bots
        if (req.body.website_url) {
            return res.json({ success: true, quotationCode: 'COT-0000' });
        }

        const {
            name,
            companyOrRuc,
            company,
            city,
            service,
            referenceItem,
            description,
            channel = 'whatsapp_direct',
            email = '',
            phone = '',
            rfpLink = '',
            timeline = '',
            budget = ''
        } = req.body;

        const cleanName = (name || '').trim();
        const cleanEntity = (companyOrRuc || company || '').trim();
        const cleanCity = (city || '').trim();
        const cleanDesc = (description || '').trim();
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanName || !cleanEntity || !cleanCity || !cleanDesc) {
            return res.status(400).json({
                success: false,
                message: 'Por favor completa Nombre, Empresa o RUC, Ciudad y Descripción del proyecto.'
            });
        }

        if (channel === 'formal_proforma') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!cleanEmail || !emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Para enviar una Proforma Formal se requiere un correo corporativo válido.'
                });
            }
        }

        const lead = new Lead({
            name: cleanName,
            companyOrRuc: cleanEntity,
            company: cleanEntity,
            city: cleanCity,
            service: (service || '').trim(),
            referenceItem: (referenceItem || '').trim(),
            description: cleanDesc,
            channel: ['whatsapp_direct', 'formal_proforma', 'web_brief'].includes(channel) ? channel : 'whatsapp_direct',
            email: cleanEmail,
            phone: (phone || '').trim(),
            rfpLink: (rfpLink || '').trim(),
            timeline,
            budget,
            source: 'b2b'
        });

        await lead.save();

        // Fire-and-forget email notifications when configured (never block fast WhatsApp response)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const adminRecipient = process.env.ADMIN_EMAIL || 'agenciavectore@gmail.com';
            const channelLabel = lead.channel === 'formal_proforma' ? 'Proforma Formal por Email' : 'Puente Directo WhatsApp';

            sendEmail({
                email: adminRecipient,
                subject: `[${lead.quotationCode}] Nueva Cotización B2B — ${cleanEntity} (${cleanCity})`,
                message: `
                    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; color: #130e3a;">
                        <h2 style="color: #8655FF; margin-bottom: 4px;">Nueva Solicitud Corporativa ${lead.quotationCode}</h2>
                        <p style="color: #555; margin-top: 0;">Canal: <strong>${channelLabel}</strong> · Score B2B: <strong>${lead.qualificationScore}/100</strong></p>
                        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Contacto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${cleanName}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Empresa / RUC:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${cleanEntity}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ciudad / Eje:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${cleanCity}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Línea:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${lead.service || 'General B2B'} ${lead.referenceItem ? `(${lead.referenceItem})` : ''}</td></tr>
                            ${cleanEmail ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${cleanEmail}</td></tr>` : ''}
                            ${lead.phone ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${lead.phone}</td></tr>` : ''}
                            ${lead.rfpLink ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>TDR / Archivos:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="${lead.rfpLink}">${lead.rfpLink}</a></td></tr>` : ''}
                        </table>
                        <div style="background: #f6f7fb; padding: 14px; border-radius: 8px; font-size: 14px;">
                            <strong>Requerimiento:</strong><br/>${cleanDesc.replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                `
            }).catch((err) => console.warn('Admin quotation email skipped:', err.message));

            if (lead.channel === 'formal_proforma' && cleanEmail) {
                sendEmail({
                    email: cleanEmail,
                    subject: `Recepción de Solicitud Corporativa ${lead.quotationCode} — Agencia Vectore`,
                    message: `
                        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #130e3a; line-height: 1.6;">
                            <div style="background: #0c0927; color: #fff; padding: 24px; border-radius: 12px 12px 0 0;">
                                <span style="font-size: 12px; letter-spacing: 0.1em; color: #a67fff; text-transform: uppercase;">Agencia Vectore · División Corporativa B2B</span>
                                <h2 style="margin: 8px 0 0;">Solicitud Registrada: ${lead.quotationCode}</h2>
                            </div>
                            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                                <p>Estimado(a) <strong>${cleanName}</strong>,</p>
                                <p>Hemos recibido el requerimiento técnico para <strong>${cleanEntity}</strong> (${cleanCity}). Nuestro equipo de ingeniería y cuentas corporativas está evaluando el alcance para remitirle la proforma formal con RUC y cronograma tentativo.</p>
                                <p style="background: #f6f7fb; padding: 12px 16px; border-left: 3px solid #8655FF; font-size: 14px;">
                                    <strong>Código de Expediente:</strong> ${lead.quotationCode}<br/>
                                    <strong>Atención Directa:</strong> agenciavectore@gmail.com · +51 950 699 910
                                </p>
                                <p style="font-size: 13px; color: #666; margin-top: 24px;">Agencia Vectore · Publicidad BTL, Arquitectura Comercial & Ingeniería de Software.</p>
                            </div>
                        </div>
                    `
                }).catch((err) => console.warn('Client acknowledgment email skipped:', err.message));
            }
        }

        res.status(201).json({
            success: true,
            quotationCode: lead.quotationCode,
            message: 'Solicitud corporativa registrada correctamente.',
            data: {
                id: lead._id,
                quotationCode: lead.quotationCode,
                priority: lead.priority
            }
        });
    } catch (error) {
        console.error('Quotation creation error:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudo procesar la solicitud en este momento.'
        });
    }
});

/**
 * GET /api/quotations/admin
 * Admin CRM inbox listing
 */
router.get('/admin', [authenticate, isAdmin], async (req, res) => {
    try {
        const leads = await Lead.find().sort({
            readAt: 1,
            priority: -1,
            createdAt: -1
        });

        const stats = {
            total: leads.length,
            pending: leads.filter(l => l.status === 'new').length,
            responded: leads.filter(l => l.status === 'contacted').length,
            qualified: leads.filter(l => l.status === 'qualified').length,
            closed: leads.filter(l => l.status === 'closed').length
        };

        res.json({ success: true, data: leads, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cargar cotizaciones.' });
    }
});

export default router;
