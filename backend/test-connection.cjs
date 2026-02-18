// Simple test to check MongoDB connection and bcrypt
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        const mongoURI = process.env.MONGODB_URI;
        console.log('URI:', mongoURI ? 'Found' : 'Not found');

        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully!');

        console.log('Database name:', mongoose.connection.name);

        await mongoose.disconnect();
        console.log('✅ Test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testConnection();
