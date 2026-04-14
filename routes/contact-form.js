import express from 'express';
import Lead from '../models/Lead.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/**
 * POST /api/contact/qualify
 * Receives qualifying form data, stores lead, sends notifications
 */
router.post('/qualify', async (req, res) => {
    try {
        const { name, email, company, service, timeline, budget, description } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required.'
            });
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Create lead
        const lead = new Lead({
            name,
            email,
            company: company || '',
            service: service || '',
            timeline: timeline || '',
            budget: budget || '',
            description: description || '',
            source: req.locale || 'en'
        });

        await lead.save();

        // Determine notification level
        const isHighValue = lead.qualificationScore >= 60;
        const isPriority = lead.qualificationScore >= 40;

        // Format service/budget labels for email
        const serviceLabels = {
            'ai_agents': 'AI Agents & Automation',
            '3d_renders': '3D Renders & Digital Assets',
            'branding': 'Brand Identity & Design',
            'saas': 'SaaS / Web Application',
            'other': 'Other'
        };

        const budgetLabels = {
            'under_5k': 'Under $5,000',
            '5k-15k': '$5,000 – $15,000',
            '15k-50k': '$15,000 – $50,000',
            '50k+': '$50,000+',
            'not_sure': 'Not sure yet'
        };

        const timelineLabels = {
            'asap': 'ASAP',
            '1-2_months': '1–2 months',
            '3+_months': '3+ months',
            'exploring': 'Just exploring'
        };

        // Send notification email to admin
        const priorityTag = isHighValue ? '🔥 HIGH VALUE' : isPriority ? '⭐ PRIORITY' : '📩 NEW';

        try {
            await sendEmail({
                email: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
                subject: `${priorityTag} Lead: ${name} — ${serviceLabels[service] || service || 'General'}`,
                message: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #8655FF;">New Lead Received</h2>
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                            <p><strong>Service:</strong> ${serviceLabels[service] || service || 'Not specified'}</p>
                            <p><strong>Timeline:</strong> ${timelineLabels[timeline] || timeline || 'Not specified'}</p>
                            <p><strong>Budget:</strong> ${budgetLabels[budget] || budget || 'Not specified'}</p>
                            <p><strong>Qualification Score:</strong> ${lead.qualificationScore}/100</p>
                            ${description ? `<p><strong>Project Brief:</strong></p><p style="color: #555;">${description}</p>` : ''}
                        </div>
                        <p style="color: #888; font-size: 12px;">Source: ${lead.source.toUpperCase()} site • ${new Date().toLocaleString()}</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Don't fail the request if email fails
        }

        // Send auto-response to the lead
        try {
            const autoResponseHtml = isHighValue || isPriority
                ? `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #8655FF;">Thanks for reaching out, ${name}!</h2>
                        <p>We've received your project details and our team is already reviewing them.</p>
                        <p>Given the scope of your project, a senior team member will personally reach out within <strong>24 hours</strong> with a tailored approach.</p>
                        <p>In the meantime, feel free to check out our <a href="https://agenciavectore.com/#work" style="color: #8655FF;">recent work</a>.</p>
                        <p style="margin-top: 30px;">Best,<br><strong>The Vectore Team</strong></p>
                    </div>
                `
                : `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #8655FF;">Thanks for reaching out, ${name}!</h2>
                        <p>We've received your message and will get back to you soon.</p>
                        <p>While you wait, you might want to explore <a href="https://agenciavectore.com/software" style="color: #8655FF;">Vectore Flow</a> — our production SaaS for creative studios.</p>
                        <p style="margin-top: 30px;">Best,<br><strong>The Vectore Team</strong></p>
                    </div>
                `;

            await sendEmail({
                email: email,
                subject: `Your project inquiry — Vectore Studio`,
                message: autoResponseHtml
            });
        } catch (emailError) {
            console.error('Failed to send auto-response:', emailError);
        }

        res.json({
            success: true,
            message: 'Thank you! We\'ll be in touch within 24 hours.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
});

export default router;
