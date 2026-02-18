const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length >= 2 && v.length <= 6;
            },
            message: 'Quiz must have between 2 and 6 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v >= 0 && v < this.options.length;
            },
            message: 'Correct answer index must be valid'
        }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
}, { _id: true });

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    topic: {
        type: String,
        required: [true, 'Topic is required'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Quiz must have at least one question'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
quizSchema.index({ topic: 1, difficulty: 1 });
quizSchema.index({ createdBy: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
