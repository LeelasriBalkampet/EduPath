// Test User model with bcrypt
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.cjs');

async function testUserCreation() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        console.log('Clearing users...');
        await User.deleteMany({});

        console.log('Creating test user...');
        const testUser = await User.create({
            email: 'test@test.com',
            password: 'test123',
            name: 'Test User',
            role: 'student'
        });

        console.log('✅ User created successfully!');
        console.log('User ID:', testUser._id);
        console.log('Email:', testUser.email);

        await mongoose.disconnect();
        console.log('✅ Test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

testUserCreation();
