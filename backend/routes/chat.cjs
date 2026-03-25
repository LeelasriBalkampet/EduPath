const express = require('express');
const https = require('https');
const ChatHistory = require('../models/ChatHistory.cjs');
const { authenticate, optionalAuth } = require('../middleware/auth.cjs');
const { validationRules, validate } = require('../middleware/validation.cjs');

const router = express.Router();

// @route   POST /api/chat
// @desc    Send chat message using Gemini AI
// @access  Public (but saves history if authenticated)
router.post('/', optionalAuth, validationRules.chatMessage, validate, async (req, res) => {
    try {
        const { message, language = 'en' } = req.body;

        // Get AI response
        const { getChatResponse } = require('../services/aiService.cjs');
        let responseText;

        let historyMessages = [];
        let chatHistory = null;

        // Fetch existing history to provide context
        if (req.user) {
            try {
                chatHistory = await ChatHistory.findOne({ userId: req.user._id });
                if (chatHistory && chatHistory.messages) {
                    // Send the last 10 messages for context (5 turns)
                    historyMessages = chatHistory.messages.slice(-10);
                }
            } catch (err) {
                console.error('Error fetching history for context:', err);
            }
        }

        try {
            responseText = await getChatResponse(message, language, historyMessages);
        } catch (aiError) {
            console.error('AI Service Error:', aiError);
            // Fallback to static responses if AI fails
            const DSA_RESPONSES = {
                'binary search': {
                    en: 'Binary Search is an efficient algorithm for finding an element in a sorted array. Time Complexity: O(log n).',
                    hi: 'बाइनरी सर्च एक कुशल एल्गोरिदम है जो सॉर्ट किए गए ऐरे में एलिमेंट खोजने के लिए उपयोग होता है।',
                    te: 'బైనరీ సెర్చ్ సార్ట్ చేసిన అర్రేలో ఎలిమెంట్‌ను కనుగొనడానికి సమర్థవంతమైన అల్గారిథమ్.'
                },
                // Add more if needed or just a generic error
            };
            const query = message.toLowerCase();
            let staticResponse = {
                en: "I'm having trouble connecting to my brain right now. Please try again later.",
                hi: "मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।",
                te: "నాకు ఇప్పుడు కనెక్ట్ కావడంలో ఇబ్బంది ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి."
            };

            for (const [key, translations] of Object.entries(DSA_RESPONSES)) {
                if (query.includes(key)) {
                    staticResponse = translations;
                    break;
                }
            }
            responseText = staticResponse[language] || staticResponse.en;
        }

        // Save chat history if user is authenticated
        if (req.user) {
            try {
                let chatHistory = await ChatHistory.findOne({ userId: req.user._id });

                if (!chatHistory) {
                    chatHistory = new ChatHistory({
                        userId: req.user._id,
                        messages: []
                    });
                }

                chatHistory.messages.push({
                    role: 'user',
                    content: message,
                    language,
                    timestamp: new Date()
                });

                chatHistory.messages.push({
                    role: 'assistant',
                    content: responseText,
                    language,
                    timestamp: new Date()
                });

                await chatHistory.save();
            } catch (historyError) {
                console.error('Failed to save chat history:', historyError);
            }
        }

        res.json({
            candidates: [{
                content: {
                    parts: [{ text: responseText }]
                }
            }]
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// @route   POST /api/chat/fallback
// @desc    Fallback local chatbot
// @access  Public
router.post('/fallback', validationRules.chatMessage, validate, (req, res) => {
    const { message, language = 'en' } = req.body;

    const DSA_RESPONSES = {
        'binary search': {
            en: 'Binary Search is an efficient algorithm for finding an element in a sorted array. It works by repeatedly dividing the search interval in half.\n\nAlgorithm: Compare target with middle element. If equal, return index. If target is smaller, search left half. If target is larger, search right half.\n\nTime Complexity: O(log n) - much faster than linear search O(n).\nSpace Complexity: O(1) iterative, O(log n) recursive.\n\nRequirements: Array must be sorted.\n\nExample: Finding 7 in [1,3,5,7,9,11]\n- Check middle (5), 7>5 so search right half [7,9,11]\n- Check middle (9), 7<9 so search left\n- Found 7!',
            hi: 'बाइनरी सर्च एक कुशल एल्गोरिदम है जो सॉर्ट किए गए ऐरे में एलिमेंट खोजने के लिए उपयोग होता है। यह सर्च इंटरवल को बार-बार आधा करके काम करता है। समय जटिलता: O(log n) - लीनियर सर्च O(n) से बहुत तेज। स्पेस जटिलता: O(1) इटरेटिव, O(log n) रिकर्सिव। आवश्यकता: ऐरे सॉर्ट होना चाहिए।',
            te: 'బైనరీ సెర్చ్ సార్ట్ చేసిన అర్రేలో ఎలిమెంట్‌ను కనుగొనడానికి సమర్థవంతమైన అల్గారిథమ్. ఇది సెర్చ్ ఇంటర్వెల్‌ను పదే పదే సగానికి విభజించడం ద్వారా పనిచేస్తుంది. సమయ సంక్లిష్టత: O(log n) - లీనియర్ సెర్చ్ O(n) కంటే చాలా వేగంగా. స్పేస్: O(1) ఇటరేటివ్, O(log n) రికర్సివ్. అవసరం: అర్రే సార్ట్ చేయాలి.'
        },
        'dynamic programming': {
            en: 'Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them into overlapping subproblems and storing computed results (memoization). Key principle: Optimal substructure - optimal solution contains optimal solutions to subproblems. Approaches: Top-down (memoization) and Bottom-up (tabulation). Classic examples: Fibonacci sequence F(n) = F(n-1) + F(n-2) with Time O(n) Space O(n), 0/1 Knapsack problem Time O(n*W) Space O(n*W), Longest Common Subsequence. Used when problem has overlapping subproblems and optimal substructure. Avoids recomputation by caching results.',
            hi: 'डायनामिक प्रोग्रामिंग (DP) एक ऑप्टिमाइजेशन तकनीक है जो जटिल समस्याओं को ओवरलैपिंग सबप्रॉब्लम्स में विभाजित करके हल करती है और परिणामों को स्टोर करती है (मेमोइजेशन)। मुख्य सिद्धांत: इष्टतम सबस्ट्रक्चर - इष्टतम समाधान में सबप्रॉब्लम्स के इष्टतम समाधान होते हैं। दृष्टिकोण: टॉप-डाउन (मेमोइजेशन) और बॉटम-अप (टैबुलेशन)। क्लासिक उदाहरण: फिबोनैचि समय O(n) स्पेस O(n), नैपसैक समस्या समय O(n*W) स्पेस O(n*W)। पुनरावृत्ति से बचता है।',
            te: 'డైనమిక్ ప్రోగ్రామింగ్ (DP) जटिल సమస్యలను ఓవర్‌లాపింగ్ సబ్‌ప్రాబ్లమ్‌లుగా విభజించి ఫలితాలను నిల్వ చేసే ఆప్టిమైజేషన్ సాంకేతికత. సమయం: O(n), స్పేస్: O(n) or O(n*W). ఫిబోనాచ్చి, నాప్‌సాక్ సమస్యలలో ఉపయోగించబడుతుంది.'
        },
        'array': {
            en: 'An Array is a linear data structure that stores multiple elements of the same type in contiguous memory locations. Key characteristics: Fixed size (in most languages), indexed access starting from 0. Operations and Complexities: Access: O(1) - direct indexing, Search: O(n) linear search, Insert: O(n) - need to shift elements, Delete: O(n) - need to shift remaining elements, Traverse: O(n). Advantages: Fast random access, cache-friendly. Disadvantages: Fixed size, insertion/deletion expensive. Use cases: Storing collections, implementing other data structures (stacks, queues), matrix operations.',
            hi: 'ऐरे एक रैखिक डेटा संरचना है जो एक ही प्रकार के कई तत्वों को सन्निहित मेमोरी स्थानों में संग्रहीत करता है। एक्सेस: O(1), सर्च: O(n), इंसर्ट: O(n), डिलीट: O(n)। लाभ: तेजी से रैंडम एक्सेस, कैश-फ्रेंडली। नुकसान: निर्धारित आकार, इंसर्शन/डिलीशन महंगा।',
            te: 'అర్రే రేఖీయ డేటా స్ట్రక్చర్ ఒకే రకమైన మూలకాలను సంలగ్న మెమరీలో నిల్వ చేస్తుంది. యాక్సెస్: O(1), చేర్చు/తొలగించు: O(n). ఫలితాలను వేగంగా యాక్సెస్ చేయడానికి ఉపయోగించబడుతుంది.'
        }
    };

    const query = message.toLowerCase();
    let response = {
        en: 'I can help with DSA topics like arrays, linked lists, stacks, queues, trees, sorting, searching, and more. What would you like to learn?',
        hi: 'मैं डेटा संरचना और एल्गोरिदम के विषयों में मदद कर सकता हूँ। आप क्या सीखना चाहते हैं?',
        te: 'నేను డేటా స్ట్రక్చర్‌ల్‌లు మరియు అల్గారిథమ్‌ల్‌లో సహాయం చేయగలను. మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?'
    };

    for (const [key, translations] of Object.entries(DSA_RESPONSES)) {
        if (query.includes(key)) {
            response = translations;
            break;
        }
    }

    const responseText = response[language] || response.en;

    res.json({
        candidates: [{
            content: {
                parts: [{ text: responseText }]
            }
        }]
    });
});

// @route   GET /api/chat/history/:userId
// @desc    Get chat history for a user
// @access  Private (User themselves or Admin)
router.get('/history/:userId', authenticate, async (req, res) => {
    try {
        // Check if user is viewing their own history or is admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const chatHistory = await ChatHistory.findOne({ userId: req.params.userId });

        if (!chatHistory) {
            return res.json({ messages: [] });
        }

        res.json({
            messages: chatHistory.messages,
            updatedAt: chatHistory.updatedAt
        });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// @route   DELETE /api/chat/history/:userId
// @desc    Clear chat history for a user
// @access  Private (User themselves or Admin)
router.delete('/history/:userId', authenticate, async (req, res) => {
    try {
        // Check if user is clearing their own history or is admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        await ChatHistory.findOneAndDelete({ userId: req.params.userId });

        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Clear chat history error:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

module.exports = router;
