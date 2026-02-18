const express = require('express');
const Quiz = require('../models/Quiz.cjs');
const QuizAttempt = require('../models/QuizAttempt.cjs');
const User = require('../models/User.cjs');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth.cjs');
const { validationRules, validate } = require('../middleware/validation.cjs');

const router = express.Router();

// Helper function to calculate strength
const getStrength = (score) => {
    if (score < 50) return 'weak';
    if (score < 70) return 'average';
    return 'strong';
};

// @route   GET /api/quizzes
// @desc    Get all quizzes (with optional filters)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { topic, difficulty } = req.query;
        const filter = {};

        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;

        const quizzes = await Quiz.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID
// @access  Public
router.get('/:id', validationRules.objectId, validate, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ quiz });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// @route   POST /api/quizzes
// @desc    Create new quiz
// @access  Private (Admin only)
router.post('/', authenticate, requireRole('admin'), validationRules.createQuiz, validate, async (req, res) => {
    try {
        const { title, topic, difficulty, questions } = req.body;

        const quiz = new Quiz({
            title,
            topic,
            difficulty: difficulty || 'medium',
            questions,
            createdBy: req.user._id
        });

        await quiz.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private (Admin only)
router.put('/:id', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const { title, topic, difficulty, questions } = req.body;

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Update fields
        if (title) quiz.title = title;
        if (topic) quiz.topic = topic;
        if (difficulty) quiz.difficulty = difficulty;
        if (questions) quiz.questions = questions;

        await quiz.save();

        res.json({
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireRole('admin'), validationRules.objectId, validate, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Also delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quizId: req.params.id });

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

// @route   POST /api/quizzes/:id/attempt
// @desc    Submit quiz attempt
// @access  Private (Student only)
router.post('/:id/attempt', authenticate, requireRole('student'), validationRules.submitQuizAttempt, validate, async (req, res) => {
    try {
        const { answers } = req.body;

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate score
        let correctCount = 0;
        const processedAnswers = answers.map(answer => {
            const question = quiz.questions.id(answer.questionId);
            const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            };
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // Create quiz attempt
        const attempt = new QuizAttempt({
            studentId: req.user._id,
            quizId: quiz._id,
            topic: quiz.topic,
            score,
            totalQuestions: quiz.questions.length,
            answers: processedAnswers
        });

        await attempt.save();

        // Update student's topic scores
        const student = await User.findById(req.user._id);
        const topicScore = student.topicScores.find(t => t.topic === quiz.topic);

        if (topicScore) {
            const newTotal = topicScore.totalAttempts + 1;
            const newAvg = (topicScore.averageScore * topicScore.totalAttempts + score) / newTotal;

            topicScore.totalAttempts = newTotal;
            topicScore.averageScore = Math.round(newAvg);
            topicScore.strength = getStrength(newAvg);
            topicScore.lastAttempt = new Date();
        } else {
            student.topicScores.push({
                topic: quiz.topic,
                totalAttempts: 1,
                averageScore: score,
                strength: getStrength(score),
                lastAttempt: new Date()
            });
        }

        await student.save();

        res.status(201).json({
            message: 'Quiz attempt submitted successfully',
            attempt: {
                id: attempt._id,
                score,
                correctAnswers: correctCount,
                totalQuestions: quiz.questions.length,
                completedAt: attempt.completedAt
            }
        });
    } catch (error) {
        console.error('Submit quiz attempt error:', error);
        res.status(500).json({ error: 'Failed to submit quiz attempt' });
    }
});

// @route   GET /api/quizzes/attempts/:studentId
// @desc    Get quiz attempts for a student
// @access  Private (Student themselves or Admin)
router.get('/attempts/:studentId', authenticate, async (req, res) => {
    try {
        // Check if user is viewing their own attempts or is admin
        if (req.user._id.toString() !== req.params.studentId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const attempts = await QuizAttempt.find({ studentId: req.params.studentId })
            .populate('quizId', 'title topic difficulty')
            .sort({ completedAt: -1 });

        res.json({
            count: attempts.length,
            attempts
        });
    } catch (error) {
        console.error('Get quiz attempts error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz attempts' });
    }
});

module.exports = router;
