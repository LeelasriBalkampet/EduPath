const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['article', 'video', 'practice'], default: 'article' },
    completed: { type: Boolean, default: false }
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    activity: { type: String, required: true },
    resources: [resourceSchema],
    completed: { type: Boolean, default: false }
}, { _id: false });

const learningPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    weakTopics: {
        type: [String],
        default: []
    },
    learningPlan: [dayPlanSchema],
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'needs_review'],
        default: 'in_progress'
    },
    confidenceLevel: {
        type: String,
        enum: ['not_confident', 'somewhat_confident', 'very_confident', null],
        default: null
    },
    additionalResources: [{
        title: { type: String },
        url: { type: String },
        type: { type: String, default: 'article' },
        description: { type: String }
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

learningPlanSchema.index({ userId: 1, generatedAt: -1 });
learningPlanSchema.index({ quizId: 1 });

const LearningPlan = mongoose.model('LearningPlan', learningPlanSchema);

module.exports = LearningPlan;
