// Seed script to populate MongoDB with initial data

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.cjs');
const Quiz = require('./models/Quiz.cjs');

const seedData = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edupath';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Quiz.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        console.log('Creating admin user...');
        let admin;
        try {
            admin = await User.create({
                email: 'admin@edupath.com',
                password: 'admin123',
                name: 'Dr. Rajesh Kumar',
                role: 'admin'
            });
            console.log('✅ Created admin user');
        } catch (adminError) {
            console.error('❌ Admin user creation failed:', adminError.message);
            console.error('Full error:', adminError);
            throw adminError;
        }

        // Create sample students
        const students = await User.create([
            {
                email: 'rahul@student.com',
                password: 'student123',
                name: 'Rahul Sharma',
                role: 'student',
                preferredLanguage: 'en',
                topicScores: [
                    {
                        topic: 'Data Structures',
                        totalAttempts: 5,
                        averageScore: 45,
                        strength: 'weak',
                        lastAttempt: new Date('2024-03-10')
                    },
                    {
                        topic: 'Algorithms',
                        totalAttempts: 3,
                        averageScore: 72,
                        strength: 'strong',
                        lastAttempt: new Date('2024-03-08')
                    }
                ]
            },
            {
                email: 'priya@student.com',
                password: 'student123',
                name: 'Priya Patel',
                role: 'student',
                preferredLanguage: 'hi',
                topicScores: [
                    {
                        topic: 'Data Structures',
                        totalAttempts: 8,
                        averageScore: 85,
                        strength: 'strong',
                        lastAttempt: new Date('2024-03-12')
                    }
                ]
            },
            {
                email: 'amit@student.com',
                password: 'student123',
                name: 'Amit Reddy',
                role: 'student',
                preferredLanguage: 'te',
                topicScores: [
                    {
                        topic: 'Operating Systems',
                        totalAttempts: 4,
                        averageScore: 62,
                        strength: 'average',
                        lastAttempt: new Date('2024-03-11')
                    }
                ]
            }
        ]);
        console.log(`✅ Created ${students.length} student users`);

        // Create sample quizzes
        const quizzes = await Quiz.create([
            {
                title: 'Algorithms Fundamentals',
                topic: 'Algorithms',
                difficulty: 'easy',
                createdBy: admin._id,
                questions: [
                    {
                        text: 'What is the time complexity of binary search?',
                        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
                        correctAnswer: 1,
                        difficulty: 'easy'
                    },
                    {
                        text: 'Which sorting algorithm has the best average case time complexity?',
                        options: ['Bubble Sort', 'Merge Sort', 'Insertion Sort', 'Selection Sort'],
                        correctAnswer: 1,
                        difficulty: 'medium'
                    }
                ]
            },
            {
                title: 'Data Structures Basics',
                topic: 'Data Structures',
                difficulty: 'easy',
                createdBy: admin._id,
                questions: [
                    {
                        text: 'Which data structure uses LIFO principle?',
                        options: ['Queue', 'Stack', 'Array', 'Linked List'],
                        correctAnswer: 1,
                        difficulty: 'easy'
                    },
                    {
                        text: 'What is the time complexity of accessing an element in an array?',
                        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                        correctAnswer: 0,
                        difficulty: 'easy'
                    }
                ]
            },
            {
                title: 'Advanced Algorithms',
                topic: 'Algorithms',
                difficulty: 'hard',
                createdBy: admin._id,
                questions: [
                    {
                        text: 'What is the space complexity of merge sort?',
                        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
                        correctAnswer: 2,
                        difficulty: 'hard'
                    }
                ]
            }
        ]);
        console.log(`✅ Created ${quizzes.length} quizzes`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('Admin: admin@edupath.com / admin123');
        console.log('Student 1: rahul@student.com / student123');
        console.log('Student 2: priya@student.com / student123');
        console.log('Student 3: amit@student.com / student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
