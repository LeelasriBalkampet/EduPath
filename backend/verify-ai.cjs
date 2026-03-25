// const fetch = require('node-fetch'); // Node 18+ has native fetch


// Assuming API runs on local
const API_BASE = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('Starting verification...');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'rahul@student.com', password: 'student123', role: 'student' })

        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const { token, user } = await loginRes.json();
        console.log('Logged in as:', user.email);

        // 2. Test Chat
        console.log('Testing Chat API...');
        const chatRes = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: 'What is a binary tree?' })
        });

        const chatData = await chatRes.json();
        console.log('Chat Response:', chatData.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50) + '...');

        // 3. Get Quizzes
        console.log('Fetching Quizzes...');
        const quizzesRes = await fetch(`${API_BASE}/quizzes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { quizzes } = await quizzesRes.json();

        if (quizzes.length === 0) {
            console.log('No quizzes found.');
            return;
        }

        const quiz = quizzes[0];
        console.log(`Taking quiz: ${quiz.title}`);

        // 4. Submit Low Score Attempt
        const answers = quiz.questions.map(q => ({
            questionId: q._id,
            selectedAnswer: -1 // Wrong answer
        }));

        console.log('Submitting attempt...');
        const attemptRes = await fetch(`${API_BASE}/quizzes/${quiz._id}/attempt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers })
        });

        const attemptData = await attemptRes.json();
        console.log('Attempt Score:', attemptData.attempt?.score);

        // 5. Verify Resources
        console.log('Verifying resources...');
        // Need to refetch user to see updated resources
        const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();

        const newResources = meData.user.suggestedResources.filter(r => r.topic === quiz.topic);
        console.log(`Found ${newResources.length} suggested resources for ${quiz.topic}`);
        newResources.forEach(r => console.log(`- ${r.title}: ${r.url}`));

    } catch (err) {
        console.error('Verification failed:', err);
    }
}

run();
