const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const { validationRules, validate } = require('../middleware/validation.cjs');
const { authenticate } = require('../middleware/auth.cjs');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validationRules.register, validate, async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            name,
            role: role || 'student'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                preferredLanguage: user.preferredLanguage,
                topicScores: user.topicScores,
                suggestedResources: user.suggestedResources
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validationRules.login, validate, async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user by email and role
        const user = await User.findOne({ email, role });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                preferredLanguage: user.preferredLanguage,
                topicScores: user.topicScores,
                suggestedResources: user.suggestedResources
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                preferredLanguage: user.preferredLanguage,
                topicScores: user.topicScores,
                suggestedResources: user.suggestedResources,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = router;
