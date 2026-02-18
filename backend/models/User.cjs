const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const resourceSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    suggestedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const topicScoreSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    strength: {
        type: String,
        enum: ['weak', 'average', 'strong'],
        default: 'average'
    },
    lastAttempt: {
        type: Date
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        required: true,
        default: 'student'
    },
    preferredLanguage: {
        type: String,
        enum: ['en', 'hi', 'te'],
        default: 'en'
    },
    topicScores: [topicScoreSchema],
    suggestedResources: [resourceSchema]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude password)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
