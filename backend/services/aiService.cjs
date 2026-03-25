require('dotenv').config();

// ---------- Gemini SDK Setup ----------
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let geminiModel = null;
if (GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('✅ Gemini SDK initialized');
    } catch (err) {
        console.warn('⚠️ Gemini SDK init failed:', err.message);
    }
}

// ---------- Groq Helper ----------
const callGroq = async (prompt) => {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not defined');

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// ---------- Unified AI Call (Groq → Gemini fallback) ----------
const generateContent = async (prompt) => {
    // Try Groq API first
    if (GROQ_API_KEY) {
        try {
            const text = await callGroq(prompt);
            console.log('🟡 Response from Groq');
            return text;
        } catch (groqErr) {
            console.warn('⚠️ Groq failed:', groqErr.message?.substring(0, 100));
        }
    }

    // Fallback to Gemini
    if (geminiModel) {
        try {
            const result = await geminiModel.generateContent(prompt);
            const text = result.response.text();
            if (text) {
                console.log('🟢 Response from Gemini (fallback)');
                return text;
            }
        } catch (geminiErr) {
            console.warn('⚠️ Gemini failed:', geminiErr.message?.substring(0, 100));
        }
    }

    throw new Error('All AI providers failed. Check your API keys.');
};

// ---------- Chat Response ----------
const getChatResponse = async (message, language, history = []) => {
    let historyContext = '';
    if (history && history.length > 0) {
        historyContext = "Recent conversation history:\n" +
            history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n') + "\n\n";
    }

    const prompt = `You are an expert educational tutor. 
${historyContext}
The user is asking: "${message}".
Please provide a helpful, concise, and accurate explanation.
If the question refers to something previously discussed in the conversation history, use that context to answer.
While you are knowledgeable in all subjects, including Data Structures and Algorithms, you can help with any academic or educational questions.
Respond in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.`;

    return await generateContent(prompt);
};

// ---------- Learning Plan ----------
const getLearningPlan = async (weakTopics) => {
    const prompt = `The student is weak in the following topics: ${weakTopics.join(', ')}.
    Please suggest a personalized learning plan with 3 specific resources (articles, videos, or practice problems) for each topic.
    Format the response as a JSON array of objects, where each object has:
    {
        "topic": "Topic Name",
        "title": "Resource Title",
        "url": "Resource URL (use real, high-quality links like GeeksforGeeks, LeetCode, YouTube)",
        "description": "Brief description of why this is helpful"
    }
    Return ONLY the JSON.`;

    try {
        const text = await generateContent(prompt);
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing learning plan:', error);
        return [];
    }
};

const generateDynamicLearningPlan = async (score, targetTopics, days = 5) => {
    const prompt = `A B.Tech student scored ${score}% in a quiz.

Topic to master:
${targetTopics.map(t => `- ${t}`).join('\n')}

Generate a detailed ${days}-day learning plan to master this topic.
CRITICAL INSTRUCTION: For EACH DAY, you MUST provide an "activity" description AND an array of EXACTLY 2 helpful "resources".
The "resources" array MUST NOT be empty. Each resource MUST have:
1. "title": Description of the resource.
2. "url": A real, working URL (e.g., https://leetcode.com, https://youtube.com, https://geeksforgeeks.org).
3. "type": EXACTLY one of: "article", "video", or "practice".

Return ONLY valid JSON in this exact format (no markdown, no conversational text):
[
  {
    "day": 1,
    "activity": "Day 1 activity description",
    "resources": [
      { "title": "Understanding Concepts", "url": "https://www.geeksforgeeks.org", "type": "article" },
      { "title": "Topic Video Guide", "url": "https://www.youtube.com", "type": "video" }
    ]
  },
  {
    "day": 2,
    "activity": "Day 2 activity description",
    "resources": [
      { "title": "Practice Problems", "url": "https://leetcode.com", "type": "practice" },
      { "title": "Deep Dive Guide", "url": "https://www.freecodecamp.org", "type": "article" }
    ]
  }
]
Make sure to include ALL ${days} days and ALWAYS include the resources array for each day with valid fields.`;

    try {
        const text = await generateContent(prompt);
        // Robust JSON parsing: extract JSON array from text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonString);
        
        // Ensure resources arrays exist
        return parsed.map(day => ({
            ...day,
            resources: Array.isArray(day.resources) && day.resources.length > 0 ? day.resources : [
                { title: `Read about ${targetTopics[0] || 'the topic'}`, url: 'https://geeksforgeeks.org', type: 'article' },
                { title: `Practice ${targetTopics[0] || 'the topic'}`, url: 'https://leetcode.com', type: 'practice' }
            ]
        }));
    } catch (error) {
        console.error('Error generating dynamic learning plan:', error);
        return Array.from({ length: days }).map((_, i) => ({
            day: i + 1,
            activity: `Study and practice ${targetTopics[0] || 'core concepts'}`,
            resources: [
                { title: 'GeeksforGeeks Guide', url: 'https://geeksforgeeks.org', type: 'article' },
                { title: 'Interactive Practice', url: 'https://leetcode.com', type: 'practice' }
            ]
        }));
    }
};

// ---------- Additional Resources (for low confidence) ----------
const generateAdditionalResources = async (topics) => {
    const prompt = `A B.Tech student completed a 5-day learning plan on these topics but is NOT confident yet:
${topics.map(t => `- ${t}`).join('\n')}

Generate 5 additional study resources to help them strengthen these topics.
Focus on different types of resources than typical ones — include interactive tools, practice platforms, cheat sheets, or video playlists.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
[
  { "title": "Resource title", "url": "https://real-url.com", "type": "article", "description": "Why this helps" },
  { "title": "Resource title", "url": "https://real-url.com", "type": "video", "description": "Why this helps" },
  { "title": "Resource title", "url": "https://real-url.com", "type": "practice", "description": "Why this helps" }
]
Include all 5 resources.`;

    try {
        const text = await generateContent(prompt);
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating additional resources:', error);
        return [
            { title: `Practice problems on ${topics[0] || 'weak topics'}`, url: 'https://leetcode.com', type: 'practice', description: 'Hands-on coding practice' },
            { title: `${topics[0] || 'Topic'} video tutorial`, url: 'https://youtube.com', type: 'video', description: 'Visual explanation' },
            { title: `${topics[0] || 'Topic'} cheat sheet`, url: 'https://geeksforgeeks.org', type: 'article', description: 'Quick reference guide' }
        ];
    }
};

module.exports = {
    getChatResponse,
    getLearningPlan,
    generateDynamicLearningPlan,
    generateAdditionalResources
};
