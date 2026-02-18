const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Validation rules
const validationRules = {
    // User registration
    register: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),
        body('role')
            .optional()
            .isIn(['student', 'admin'])
            .withMessage('Role must be student or admin')
    ],

    // User login
    login: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        body('role')
            .isIn(['student', 'admin'])
            .withMessage('Role must be student or admin')
    ],

    // Quiz creation
    createQuiz: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Quiz title is required'),
        body('topic')
            .trim()
            .notEmpty()
            .withMessage('Topic is required'),
        body('difficulty')
            .optional()
            .isIn(['easy', 'medium', 'hard'])
            .withMessage('Difficulty must be easy, medium, or hard'),
        body('questions')
            .isArray({ min: 1 })
            .withMessage('At least one question is required'),
        body('questions.*.text')
            .trim()
            .notEmpty()
            .withMessage('Question text is required'),
        body('questions.*.options')
            .isArray({ min: 2, max: 6 })
            .withMessage('Question must have 2-6 options'),
        body('questions.*.correctAnswer')
            .isInt({ min: 0 })
            .withMessage('Correct answer must be a valid index')
    ],

    // Quiz attempt
    submitQuizAttempt: [
        body('answers')
            .isArray({ min: 1 })
            .withMessage('Answers array is required'),
        body('answers.*.questionId')
            .notEmpty()
            .withMessage('Question ID is required'),
        body('answers.*.selectedAnswer')
            .isInt({ min: 0 })
            .withMessage('Selected answer must be a valid index')
    ],

    // Chat message
    chatMessage: [
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message cannot be empty'),
        body('language')
            .optional()
            .isIn(['en', 'hi', 'te'])
            .withMessage('Language must be en, hi, or te')
    ],

    // Update language
    updateLanguage: [
        body('language')
            .isIn(['en', 'hi', 'te'])
            .withMessage('Language must be en, hi, or te')
    ],

    // MongoDB ObjectId validation
    objectId: [
        param('id')
            .isMongoId()
            .withMessage('Invalid ID format')
    ]
};

module.exports = {
    validate,
    validationRules
};
