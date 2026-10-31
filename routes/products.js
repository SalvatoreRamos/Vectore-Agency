import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get In-House Manufacturing & Solutions capabilities (excludes retail stock/price on public queries)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            subcategory,
            scope,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 100
        } = req.query;

        const query = { isAvailable: { $ne: false } };

        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (scope && scope !== 'all') {
            if (scope === 'local') {
                query.$or = [{ scope: 'local' }, { scope: { $exists: false } }, { scope: null }];
            } else {
                query.scope = scope;
            }
        }
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .select('-__v -stock -price');

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: true === false,
            message: 'Error fetching workshop capabilities',
            error: error.message
        });
    }
});

// @route   GET /api/products/featured/list
router.get('/featured/list', async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true })
            .sort('-createdAt')
            .limit(6)
            .select('-__v -stock -price');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching featured capabilities' });
    }
});

// @route   GET /api/products/category/:category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.category,
            isAvailable: true
        }).sort('-createdAt').select('-__v -stock -price');

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching category items' });
    }
});

// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('-__v -stock -price');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching item', error: error.message });
    }
});

// @route   POST /api/products
// @desc    Create new In-House Manufacturing / Solution capability (price & stock optional)
// @access  Private/Admin
router.post('/', [authenticate, isAdmin], [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['diseno', 'impresion', 'packaging', 'senalizacion', 'vinilo', 'digital', 'espacios']).withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const payload = {
            ...req.body,
            subcategory: req.body.subcategory || 'Taller In-House',
            price: req.body.price !== undefined && req.body.price !== '' ? Number(req.body.price) : null,
            createdBy: req.user._id
        };

        const product = new Product(payload);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Capacidad de producción registrada exitosamente',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating item',
            error: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.price === '' || updates.price === undefined) {
            updates.price = null;
        } else {
            updates.price = Number(updates.price);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({
            success: true,
            message: 'Capacidad actualizada exitosamente',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating item',
            error: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, message: 'Capacidad eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting item', error: error.message });
    }
});

export default router;
