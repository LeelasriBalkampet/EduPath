const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.cjs');
const Quiz = require('./models/Quiz.cjs');
const ChatHistory = require('./models/ChatHistory.cjs');
const QuizAttempt = require('./models/QuizAttempt.cjs');

const checkData = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('🔍 Connecting to Database...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB\n');

        // Check Users
        const userCount = await User.countDocuments();
        const users = await User.find({}, 'name email role').limit(5);
        console.log(`👥 USERS (${userCount} total):`);
        users.forEach(u => console.log(`  - ${u.name} (${u.email}) [${u.role}]`));
        if (userCount > 5) console.log('    ... and more');
        console.log('');

        // Check Quizzes
        const quizCount = await Quiz.countDocuments();
        const quizzes = await Quiz.find({}, 'title topic').limit(5);
        console.log(`📝 QUIZZES (${quizCount} total):`);
        quizzes.forEach(q => console.log(`  - ${q.title} (${q.topic})`));
        if (quizCount > 5) console.log('    ... and more');
        console.log('');

        // Check Chat Logs
        const chatCount = await ChatHistory.countDocuments();
        console.log(`💬 CHAT LOGS: ${chatCount} total records`);
        console.log('');

        // Check Quiz Attempts
        const attemptCount = await QuizAttempt.countDocuments();
        console.log(`🎯 QUIZ ATTEMPTS: ${attemptCount} total records`);
        console.log('');

        console.log('--- Inspection Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
};

checkData();
