import express from 'express';
import Lead from '../models/Lead.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/contact/qualify
 * Receives qualifying form data and stores it for the admin inbox
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
            source: req.site === 'pe' ? 'es' : 'en'
        });

        await lead.save();

        res.json({
            success: true,
            message: 'Thank you! Your project brief has been received.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
});

/**
 * GET /api/contact/admin/leads
 * Returns all stored briefs for the admin inbox
 */
router.get('/admin/leads', authenticate, isAdmin, async (req, res) => {
    try {
        const leads = await Lead.find().sort({
            readAt: 1,
            priority: -1,
            createdAt: -1
        });

        const stats = {
            total: leads.length,
            pending: leads.filter(lead => lead.status === 'new').length,
            responded: leads.filter(lead => lead.status === 'contacted').length,
            qualified: leads.filter(lead => lead.status === 'qualified').length,
            closed: leads.filter(lead => lead.status === 'closed').length
        };

        res.json({
            success: true,
            data: leads,
            stats
        });
    } catch (error) {
        console.error('Admin leads fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not load briefs.'
        });
    }
});

/**
 * PUT /api/contact/admin/leads/:id
 * Updates status, priority, notes and read state of a brief
 */
router.put('/admin/leads/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, priority, internalNotes, markAsRead, markAsUnread } = req.body;
        const lead = await Lead.findById(req.params.id);
        const allowedStatuses = ['new', 'contacted', 'qualified', 'closed'];
        const allowedPriorities = ['low', 'medium', 'high'];

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Brief not found.'
            });
        }

        if (typeof status === 'string') {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid brief status.'
                });
            }
            lead.status = status;
        }

        if (typeof priority === 'string') {
            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid brief priority.'
                });
            }
            lead.priority = priority;
        }

        if (typeof internalNotes === 'string') {
            lead.internalNotes = internalNotes.trim();
        }

        if (markAsRead === true) {
            lead.readAt = lead.readAt || new Date();
        }

        if (markAsUnread === true) {
            lead.readAt = null;
        }

        await lead.save();

        res.json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Admin lead update error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update brief.'
        });
    }
});

export default router;
