const express = require('express');
const User = require('../models/User.cjs');
const { authenticate, requireRole } = require('../middleware/auth.cjs');
const { validationRules, validate } = require('../middleware/validation.cjs');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            count: students.length,
            students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Admin only)
router.get('/:id', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const student = await User.findOne({
            _id: req.params.id,
            role: 'student'
        }).select('-password');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin only)
router.put('/:id', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const { name, email, preferredLanguage } = req.body;

        const student = await User.findOne({
            _id: req.params.id,
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Update fields
        if (name) student.name = name;
        if (email) student.email = email;
        if (preferredLanguage) student.preferredLanguage = preferredLanguage;

        await student.save();

        res.json({
            message: 'Student updated successfully',
            student: student.toJSON()
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const student = await User.findOneAndDelete({
            _id: req.params.id,
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// @route   PUT /api/students/:id/language
// @desc    Update student's preferred language
// @access  Private (Student themselves or Admin)
router.put('/:id/language', authenticate, validationRules.updateLanguage, validate, async (req, res) => {
    try {
        const { language } = req.body;

        // Check if user is updating their own language or is admin
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const student = await User.findOne({
            _id: req.params.id,
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.preferredLanguage = language;
        await student.save();

        res.json({
            message: 'Language updated successfully',
            preferredLanguage: student.preferredLanguage
        });
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({ error: 'Failed to update language' });
    }
});

// @route   POST /api/students/:id/resources
// @desc    Add a suggested resource for a student
// @access  Private (Admin only)
router.post('/:id/resources', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const { topic, title, url, description } = req.body;
        console.log(`[DEBUG] Adding resource for student ${req.params.id}:`, { topic, title, url });

        const student = await User.findOne({
            _id: req.params.id,
            role: 'student'
        });

        if (!student) {
            console.log(`[DEBUG] Student ${req.params.id} not found`);
            return res.status(404).json({ error: 'Student not found' });
        }

        if (!student.suggestedResources) {
            console.log(`[DEBUG] suggestedResources array missing, initializing...`);
            student.suggestedResources = [];
        }

        student.suggestedResources.push({ topic, title, url, description });
        console.log(`[DEBUG] Resource pushed. Total count: ${student.suggestedResources.length}`);

        await student.save();
        console.log(`[DEBUG] Student saved successfully with new resource`);

        res.status(201).json({
            message: 'Resource suggested successfully',
            suggestedResources: student.suggestedResources
        });
    } catch (error) {
        console.error('Suggest resource error:', error);
        res.status(500).json({ error: 'Failed to suggest resource', details: error.message });
    }
});

// @route   DELETE /api/students/:id/resources/:resourceId
// @desc    Remove a suggested resource
// @access  Private (Admin only)
router.delete('/:id/resources/:resourceId', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const student = await User.findOne({
            _id: req.params.id,
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.suggestedResources = student.suggestedResources.filter(
            r => r._id.toString() !== req.params.resourceId
        );

        await student.save();

        res.json({
            message: 'Resource removed successfully',
            suggestedResources: student.suggestedResources
        });
    } catch (error) {
        console.error('Remove resource error:', error);
        res.status(500).json({ error: 'Failed to remove resource' });
    }
});

module.exports = router;
