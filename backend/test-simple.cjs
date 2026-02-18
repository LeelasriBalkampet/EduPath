// Simplified seed test without password hashing
const mongoose = require('mongoose');
require('dotenv').config();

async function testSimpleSeed() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to:', mongoose.connection.name);

        // Create a simple schema without password hashing
        const TestUserSchema = new mongoose.Schema({
            email: String,
            name: String,
            role: String
        });

        const TestUser = mongoose.model('TestUser', TestUserSchema);

        console.log('Clearing test users...');
        await TestUser.deleteMany({});

        console.log('Creating test user...');
        const user = await TestUser.create({
            email: 'test@test.com',
            name: 'Test User',
            role: 'student'
        });

        console.log('✅ User created!', user._id);

        await mongoose.disconnect();
        console.log('✅ Test passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testSimpleSeed();
