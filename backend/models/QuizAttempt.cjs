const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: Number,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: [answerSchema],
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
quizAttemptSchema.index({ studentId: 1, completedAt: -1 });
quizAttemptSchema.index({ quizId: 1 });
quizAttemptSchema.index({ topic: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;
