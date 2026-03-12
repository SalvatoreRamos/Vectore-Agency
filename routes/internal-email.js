import express from 'express';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/**
 * Internal email endpoint for Vectore Flow SaaS
 * Called by Supabase Edge Functions to send subscription reminders.
 * Protected by an internal API key.
 * 
 * POST /api/internal/send-email
 * Headers: X-Internal-Key: <shared secret>
 * Body: { email, subject, message }
 */
router.post('/send-email', async (req, res) => {
    try {
        // Validate internal API key
        const internalKey = req.headers['x-internal-key'];
        const expectedKey = process.env.INTERNAL_API_KEY || process.env.EMAIL_PASS;

        if (!internalKey || internalKey !== expectedKey) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid internal API key'
            });
        }

        const { email, subject, message } = req.body;

        // Basic validation
        if (!email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, subject, message'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Rate limit: max 20 internal emails per minute
        // (Simple in-memory rate limiting)
        const now = Date.now();
        if (!router._rateLimitState) {
            router._rateLimitState = { count: 0, resetAt: now + 60000 };
        }
        if (now > router._rateLimitState.resetAt) {
            router._rateLimitState = { count: 0, resetAt: now + 60000 };
        }
        router._rateLimitState.count++;

        if (router._rateLimitState.count > 20) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded for internal emails'
            });
        }

        // Send the email using the existing sendEmail utility
        const result = await sendEmail({
            email,
            subject,
            message
        });

        console.log(`[INTERNAL_EMAIL] ✅ Sent to ${email}: "${subject}"`);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('[INTERNAL_EMAIL] ❌ Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

export default router;
