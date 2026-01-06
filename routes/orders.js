import express from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate, isAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', [
    body('customer.name').notEmpty().withMessage('Customer name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required'),
    body('customer.phone').notEmpty().withMessage('Phone is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('paymentMethod').isIn(['stripe', 'paypal', 'cash', 'transfer']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { customer, items, paymentMethod, notes } = req.body;

        // Validate and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            if (!product.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `Product not available: ${product.name}`
                });
            }

            // Check stock for physical products
            if (product.category === 'physical' && product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for: ${product.name}`
                });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });

            // Update stock for physical products
            if (product.category === 'physical') {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        // Calculate tax and shipping (customize as needed)
        const tax = subtotal * 0.1; // 10% tax
        const shipping = items.some(item => {
            const product = items.find(i => i.productId === item.productId);
            return product?.category === 'physical';
        }) ? 10 : 0; // $10 shipping for physical items

        const total = subtotal + tax + shipping;

        // Create order
        const order = new Order({
            customer,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            paymentMethod,
            notes,
            statusHistory: [{
                status: 'pending',
                date: new Date(),
                note: 'Order created'
            }]
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// @route   POST /api/orders/:id/payment/stripe
// @desc    Process Stripe payment
// @access  Public
router.post('/:id/payment/stripe', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order already paid'
            });
        }

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.total * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
});

// @route   POST /api/orders/:id/payment/confirm
// @desc    Confirm payment
// @access  Public
router.post('/:id/payment/confirm', async (req, res) => {
    try {
        const { transactionId, paymentInfo } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = 'completed';
        order.paymentDetails = {
            transactionId,
            paymentDate: new Date(),
            paymentInfo
        };
        order.orderStatus = 'confirmed';
        order.statusHistory.push({
            status: 'confirmed',
            date: new Date(),
            note: 'Payment confirmed'
        });

        await order.save();

        res.json({
            success: true,
            message: 'Payment confirmed',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error confirming payment',
            error: error.message
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (admin) or user orders
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = {};

        // If not admin, only show user's orders (by email)
        if (req.user.role !== 'admin') {
            query['customer.email'] = req.user.email;
        }

        if (status) {
            query.orderStatus = status;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const orders = await Order.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .populate('items.product');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
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
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public (with order number) / Private
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check access rights
        if (req.user) {
            if (req.user.role !== 'admin' && order.customer.email !== req.user.email) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', [authenticate, isAdmin], async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        order.statusHistory.push({
            status,
            date: new Date(),
            note
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

export default router;
