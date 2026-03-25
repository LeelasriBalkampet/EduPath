const express = require('express');

const { authenticate, requireRole } = require('../middleware/auth.cjs');
const QuizAttempt = require('../models/QuizAttempt.cjs');
const User = require('../models/User.cjs');
const LearningPlan = require('../models/LearningPlan.cjs');

const {
    generateDynamicLearningPlan,
    generateAdditionalResources
} = require('../services/aiService.cjs');

const router = express.Router();


// ============================================================
// POST /api/ai/generate-learning-plan
// ============================================================
router.post('/generate-learning-plan', authenticate, requireRole('student'), async (req, res) => {
    try {
        const { quizId, days } = req.body;
        const planDays = parseInt(days) || 5;

        if (!quizId) {
            return res.status(400).json({ error: 'quizId is required' });
        }

        const attempt = await QuizAttempt.findOne({
            studentId: req.user._id,
            quizId
        }).sort({ completedAt: -1 });

        if (!attempt) {
            return res.status(404).json({ error: 'No quiz attempt found' });
        }

        // Create a plan specifically tailored to the topic of the quiz just taken.
        const topics = [attempt.topic || 'General Tech Concepts'];

        // Call AI
        const learningPlan = await generateDynamicLearningPlan(attempt.score, topics, planDays);

        // Store in MongoDB
        const plan = new LearningPlan({
            userId: req.user._id,
            quizId,
            score: attempt.score,
            weakTopics: topics,
            learningPlan
        });
        await plan.save();

        res.json({
            message: 'Learning plan generated',
            plan: {
                id: plan._id,
                score: attempt.score,
                weakTopics: topics,
                learningPlan: plan.learningPlan,
                status: plan.status,
                confidenceLevel: plan.confidenceLevel,
                additionalResources: plan.additionalResources,
                generatedAt: plan.generatedAt
            }
        });
    } catch (error) {
        console.error('Learning plan error:', error);
        res.status(500).json({ error: 'Failed to generate learning plan' });
    }
});

// ============================================================
// GET /api/ai/learning-plan/latest
// ============================================================
router.get('/learning-plan/latest', authenticate, requireRole('student'), async (req, res) => {
    try {
        const plan = await LearningPlan.findOne({ userId: req.user._id })
            .sort({ generatedAt: -1 });

        if (!plan) {
            return res.json({ plan: null });
        }

        res.json({
            plan: {
                id: plan._id,
                score: plan.score,
                weakTopics: plan.weakTopics,
                learningPlan: plan.learningPlan,
                status: plan.status,
                confidenceLevel: plan.confidenceLevel,
                additionalResources: plan.additionalResources,
                generatedAt: plan.generatedAt
            }
        });
    } catch (error) {
        console.error('Get latest plan error:', error);
        res.status(500).json({ error: 'Failed to fetch learning plan' });
    }
});

// ============================================================
// GET /api/ai/learning-plans (All history)
// ============================================================
router.get('/learning-plans', authenticate, requireRole('student'), async (req, res) => {
    try {
        const plans = await LearningPlan.find({ userId: req.user._id })
            .sort({ generatedAt: -1 });

        res.json({
            plans: plans.map(plan => ({
                id: plan._id,
                score: plan.score,
                weakTopics: plan.weakTopics,
                status: plan.status,
                confidenceLevel: plan.confidenceLevel,
                generatedAt: plan.generatedAt
            }))
        });
    } catch (error) {
        console.error('Get all plans error:', error);
        res.status(500).json({ error: 'Failed to fetch learning plans history' });
    }
});

// ============================================================
// GET /api/ai/learning-plan/:planId
// ============================================================
router.get('/learning-plan/:planId', authenticate, requireRole('student'), async (req, res) => {
    try {
        const plan = await LearningPlan.findOne({ _id: req.params.planId, userId: req.user._id });

        if (!plan) {
            return res.status(404).json({ error: 'Learning plan not found' });
        }

        res.json({
            plan: {
                id: plan._id,
                score: plan.score,
                weakTopics: plan.weakTopics,
                learningPlan: plan.learningPlan,
                status: plan.status,
                confidenceLevel: plan.confidenceLevel,
                additionalResources: plan.additionalResources,
                generatedAt: plan.generatedAt
            }
        });
    } catch (error) {
        console.error('Get plan by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch learning plan' });
    }
});

// ============================================================
// PUT /api/ai/learning-plan/:planId/resource
// ============================================================
router.put('/learning-plan/:planId/resource', authenticate, requireRole('student'), async (req, res) => {
    try {
        const { planId } = req.params;
        const { dayNumber, resourceIndex, completed } = req.body;

        const plan = await LearningPlan.findOne({ _id: planId, userId: req.user._id });
        if (!plan) return res.status(404).json({ error: 'Learning plan not found' });

        const dayItem = plan.learningPlan.find(d => d.day === dayNumber);
        if (!dayItem) return res.status(400).json({ error: 'Day not found' });
        if (!dayItem.resources[resourceIndex]) return res.status(400).json({ error: 'Resource not found' });

        // Update resource completion
        dayItem.resources[resourceIndex].completed = completed;

        // Auto-complete day if all resources are done
        const allDone = dayItem.resources.every(r => r.completed);
        dayItem.completed = allDone;

        // Check if entire plan is completed
        const allDaysComplete = plan.learningPlan.every(d => d.completed);
        if (allDaysComplete) {
            plan.status = 'completed';
        }

        await plan.save();

        res.json({
            message: 'Resource updated',
            plan: {
                id: plan._id,
                learningPlan: plan.learningPlan,
                status: plan.status,
                confidenceLevel: plan.confidenceLevel,
                additionalResources: plan.additionalResources
            }
        });
    } catch (error) {
        console.error('Resource update error:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// ============================================================
// GET /api/ai/admin/all-plans (Admin only)
// ============================================================
router.get('/admin/all-plans', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const plans = await LearningPlan.find()
            .populate('userId', 'name email')
            .sort({ generatedAt: -1 });

        res.json({
            plans: plans.map(plan => ({
                id: plan._id,
                studentName: plan.userId?.name || 'Unknown',
                studentEmail: plan.userId?.email || 'Unknown',
                score: plan.score,
                weakTopics: plan.weakTopics,
                status: plan.status,
                generatedAt: plan.generatedAt
            }))
        });
    } catch (error) {
        console.error('Admin get all plans error:', error);
        res.status(500).json({ error: 'Failed to fetch all learning plans' });
    }
});

// ============================================================
// DELETE /api/ai/learning-plan/:planId
// ============================================================
router.delete('/learning-plan/:planId', authenticate, async (req, res) => {
    try {
        const plan = await LearningPlan.findById(req.params.planId);
        if (!plan) return res.status(404).json({ error: 'Learning plan not found' });

        // Only Admin or the owner can delete
        if (req.user.role !== 'admin' && plan.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await LearningPlan.findByIdAndDelete(req.params.planId);
        res.json({ message: 'Learning plan deleted successfully' });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({ error: 'Failed to delete learning plan' });
    }
});

// ============================================================
// PUT /api/ai/learning-plan/:planId/confidence
// ============================================================
router.put('/learning-plan/:planId/confidence', authenticate, requireRole('student'), async (req, res) => {
    try {
        const { planId } = req.params;
        const { confidenceLevel } = req.body;

        const validLevels = ['not_confident', 'somewhat_confident', 'very_confident'];
        if (!validLevels.includes(confidenceLevel)) {
            return res.status(400).json({ error: 'Invalid confidence level' });
        }

        const plan = await LearningPlan.findOne({ _id: planId, userId: req.user._id });
        if (!plan) return res.status(404).json({ error: 'Learning plan not found' });

        plan.confidenceLevel = confidenceLevel;

        // If not confident, generate additional resources
        if (confidenceLevel === 'not_confident') {
            plan.status = 'needs_review';
            const extraResources = await generateAdditionalResources(plan.weakTopics);
            plan.additionalResources = extraResources;
        } else {
            plan.status = 'completed';
        }

        await plan.save();

        res.json({
            message: 'Confidence recorded',
            plan: {
                id: plan._id,
                confidenceLevel: plan.confidenceLevel,
                status: plan.status,
                additionalResources: plan.additionalResources
            }
        });
    } catch (error) {
        console.error('Confidence update error:', error);
        res.status(500).json({ error: 'Failed to update confidence' });
    }
});





module.exports = router;
