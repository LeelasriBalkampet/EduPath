const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'te'],
        default: 'en'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

// Index for faster user lookups
chatHistorySchema.index({ userId: 1 });

// Limit messages to last 100 to prevent unbounded growth
chatHistorySchema.pre('save', function (next) {
    if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
    }
    next();
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
