const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
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
    strongTopics: {
        type: [String],
        default: []
    },
    weakTopics: {
        type: [String],
        default: []
    },
    skillAnalysis: {
        strongAreas: { type: [String], default: [] },
        weakAreas: { type: [String], default: [] },
        recommendedFocus: { type: [String], default: [] }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ quizId: 1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
