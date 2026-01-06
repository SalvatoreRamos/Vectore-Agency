import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import Quotation from '../models/Quotation.js';
import { authenticate, isAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// @route   POST /api/quotations
// @desc    Create new quotation with AI suggestions
// @access  Public
router.post('/', [
    body('customer.name').notEmpty().withMessage('Customer name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required'),
    body('projectType').notEmpty().withMessage('Project type is required'),
    body('description').notEmpty().withMessage('Project description is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const quotationData = req.body;

        // Generate AI suggestions if OpenAI is configured
        if (openai && quotationData.description) {
            try {
                const prompt = `You are an expert advertising agency consultant. A client has requested a quotation for the following project:

Project Type: ${quotationData.projectType}
Description: ${quotationData.description}
${quotationData.requirements ? `Requirements: ${quotationData.requirements.join(', ')}` : ''}
${quotationData.budget ? `Budget Range: $${quotationData.budget.min} - $${quotationData.budget.max}` : ''}

Please provide:
1. A detailed breakdown of recommended services and deliverables
2. Estimated timeline
3. Suggested pricing for each component
4. Professional recommendations to maximize project success

Format the response in a clear, professional manner suitable for a client quotation.`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional advertising agency consultant providing detailed project quotations."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                });

                quotationData.aiSuggestions = completion.choices[0].message.content;
            } catch (aiError) {
                console.error('OpenAI error:', aiError);
                // Continue without AI suggestions
            }
        }

        const quotation = new Quotation(quotationData);
        await quotation.save();

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating quotation',
            error: error.message
        });
    }
});

// @route   GET /api/quotations
// @desc    Get all quotations (admin) or user quotations
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, projectType, page = 1, limit = 10 } = req.query;

        let query = {};

        // If not admin, only show user's quotations
        if (req.user.role !== 'admin') {
            query['customer.email'] = req.user.email;
        }

        if (status) query.status = status;
        if (projectType) query.projectType = projectType;

        const skip = (Number(page) - 1) * Number(limit);
        const quotations = await Quotation.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Quotation.countDocuments(query);

        res.json({
            success: true,
            data: quotations,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quotations',
            error: error.message
        });
    }
});

// @route   GET /api/quotations/:id
// @desc    Get quotation by ID
// @access  Public (with quotation number) / Private
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Check access rights
        if (req.user) {
            if (req.user.role !== 'admin' && quotation.customer.email !== req.user.email) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quotation',
            error: error.message
        });
    }
});

// @route   PUT /api/quotations/:id
// @desc    Update quotation
// @access  Private/Admin
router.put('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== '_id' && key !== 'quotationNumber') {
                quotation[key] = req.body[key];
            }
        });

        await quotation.save();

        res.json({
            success: true,
            message: 'Quotation updated successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating quotation',
            error: error.message
        });
    }
});

// @route   PUT /api/quotations/:id/status
// @desc    Update quotation status
// @access  Private/Admin
router.put('/:id/status', [authenticate, isAdmin], async (req, res) => {
    try {
        const { status } = req.body;
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        quotation.status = status;
        await quotation.save();

        res.json({
            success: true,
            message: 'Quotation status updated',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating quotation status',
            error: error.message
        });
    }
});

// @route   DELETE /api/quotations/:id
// @desc    Delete quotation
// @access  Private/Admin
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        await quotation.deleteOne();

        res.json({
            success: true,
            message: 'Quotation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting quotation',
            error: error.message
        });
    }
});

// @route   POST /api/quotations/:id/accept
// @desc    Accept quotation (convert to order)
// @access  Public
router.post('/:id/accept', async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        if (quotation.status === 'expired') {
            return res.status(400).json({
                success: false,
                message: 'Quotation has expired'
            });
        }

        quotation.status = 'accepted';
        await quotation.save();

        res.json({
            success: true,
            message: 'Quotation accepted successfully',
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error accepting quotation',
            error: error.message
        });
    }
});

export default router;
