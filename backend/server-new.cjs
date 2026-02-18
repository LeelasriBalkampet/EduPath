// backend/server.cjs

const express = require("express");
const https = require("https");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, language = "en" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    console.log("Incoming message:", message);
    console.log("Language:", language);
    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not found in environment variables",
      });
    }

    // Prompt Gemini to respond in the user's language
    const languageMap = {
      en: "English",
      hi: "Hindi",
      te: "Telugu"
    };
    
    const langName = languageMap[language] || "English";
    const systemPrompt = `You are an expert Data Structures & Algorithms tutor. Answer the following question about DSA in ${langName} language. Keep explanations clear, concise, and educational.`;
    
    const fullMessage = `${systemPrompt}\n\nQuestion: ${message}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: fullMessage }] }],
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const result = JSON.parse(data);
          
          if (response.statusCode !== 200) {
            console.error("Gemini API error:", result);
            return res.status(response.statusCode).json(result);
          }

          console.log("Gemini raw response:", JSON.stringify(result, null, 2));
          res.json(result);
        } catch (error) {
          console.error("Parse error:", error);
          res.status(500).json({ error: "Failed to parse response" });
        }
      });
    });

    request.on("error", (error) => {
      console.error("HTTPS request error:", error);
      res.status(500).json({ error: error.message || "Gemini API failed" });
    });

    request.write(postData);
    request.end();
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Fallback local chatbot - supports 3 languages
app.post("/api/chat-fallback", (req, res) => {
  const { message, language = "en" } = req.body;
  
  const DSA_RESPONSES = {
    "dynamic programming": {
      en: "Dynamic Programming solves problems by breaking them into overlapping subproblems and storing results. Examples: Fibonacci, Knapsack. Time: O(n*m), Space: O(n*m).",
      hi: "डायनामिक प्रोग्रामिंग समस्याओं को ओवरलैपिंग सबप्रॉब्लम्स में विभाजित करके हल करता है। उदाहरण: फिबोनैचि, नैपसैक। समय: O(n*m), स्पेस: O(n*m)।",
      te: "డైనమిక్ ప్రోగ్రామింగ్ సమస్యలను ఓవర్‌లాపింగ్ సబ్‌ప్రాబ్లమ్‌లుగా విభజించి పరిష్కరిస్తుంది। ఉదాహరణలు: ఫిబోనాచ్చి, నాప్‌సాక్। సమయం: O(n*m)."
    },
    "array": {
      en: "An array stores elements in contiguous memory locations. Access: O(1), Insert/Delete: O(n). Cache-friendly and fixed size.",
      hi: "ऐरे तत्वों को सन्निहित मेमोरी स्थानों में संग्रहीत करता है। एक्सेस: O(1), इंसर्ट/डिलीट: O(n)। कैश-फ्रेंडली।",
      te: "అర్రే మూలకాలను ఏకీభవిస్తున్న మెమరీ ప్రదేశాలలో నిల్వ చేస్తుంది. యాక్సెస్: O(1), చేర్చు/తొలగించు: O(n)."
    },
    "linked list": {
      en: "Linked List: Nodes connected by pointers. Access: O(n), Insert/Delete: O(1) at known position. Dynamic size. Good for frequent insertions.",
      hi: "लिंक्ड लिस्ट: नोड्स पॉइंटर द्वारा जुड़े होते हैं। एक्सेस: O(n), इंसर्ट/डिलीट: O(1)। डायनामिक आकार।",
      te: "లింక్డ్ లిస్ట్: నోడ్‌లు పాయింటర్‌ల ద్వారా కనెక్ట్ చేయబడ్డాయి. యాక్సెస్: O(n), చేర్చు/తొలగించు: O(1)."
    },
    "stack": {
      en: "Stack (LIFO): Last In First Out principle. Push/Pop/Peek: O(1). Used for recursion, undo functionality, and expression evaluation.",
      hi: "स्टैक (LIFO): आखिरी में आने वाला पहले निकलता है। पुश/पॉप/पीक: O(1)। रिकर्सन, अंडू में उपयोग।",
      te: "స్టాక్ (LIFO): చివరిది ముందుగా బయటపడుతుంది. పుష్/పాప్/పీక్: O(1). రికర్సన్‌లో ఉపయోగించబడుతుంది."
    },
    "queue": {
      en: "Queue (FIFO): First In First Out principle. Enqueue/Dequeue: O(1). Used for BFS, scheduling, and task management systems.",
      hi: "क्यू (FIFO): पहले आने वाला पहले निकलता है। एनक्यू/डीक्यू: O(1)। BFS, शेड्यूलिंग में उपयोग।",
      te: "క్యూ (FIFO): ముందుగా రాడానిది ముందుగా బయటపడుతుంది. ఎన్‌క్యూ/డీక్యూ: O(1). BFS, షెడ్యూలింగ్‌లో ఉపయోగించబడుతుంది."
    },
    "tree": {
      en: "Tree: Hierarchical data structure with root node. Each node has children. Used in databases, file systems, and DOM structures.",
      hi: "ट्री: जड़ नोड के साथ पदानुक्रमित संरचना। प्रत्येक नोड के बच्चे हो सकते हैं। डेटाबेस में उपयोग।",
      te: "చెట్టు: రూట్ నోడ్‌తో సోపాన నిర్మాణం. ప్రతి నోడ్‌కు సంతానాలు ఉండవచ్చు. ఫైల్ సిస్టమ్‌లలో ఉపయోగం."
    },
    "binary search tree": {
      en: "BST: Left < Parent < Right property. Search/Insert/Delete: O(log n) average, O(n) worst. Inorder traversal gives sorted sequence.",
      hi: "BST: बाएं < माता-पिता < दाएं संपत्ति। सर्च/इंसर्ट/डिलीट: O(log n) औसतन, O(n) सबसे बुरे। इनऑर्डर सॉर्ट किया हुआ क्रम।",
      te: "BST: ఎడమ < తల్లిదండ్రులు < కుడి లక్షణం. సర్చ్/చేర్చు/తొలగించు: O(log n) సగటు, O(n) చెత్త."
    },
    "binary search": {
      en: "Binary Search: Efficiently finds elements in sorted arrays. Time: O(log n). Divides search space by half in each iteration.",
      hi: "बाइनरी सर्च: सॉर्टेड ऐरे में तत्व खोजता है। समय: O(log n)। हर बार सर्च स्पेस को आधा करता है।",
      te: "బైనరీ సెర్చ్: క్రమబద్ధ శ్రేణిలో సమయం O(log n). ప్రతిసారీ సెర్చ్ స్పేస్‌ను విభజిస్తుంది."
    },
    "sorting": {
      en: "Sorting algorithms arrange elements in order. QuickSort: O(n log n) avg, MergeSort: O(n log n) always, HeapSort: O(n log n).",
      hi: "सॉर्टिंग एल्गोरिदम तत्वों को क्रम में व्यवस्थित करते हैं। क्विकसॉर्ट: O(n log n) औसतन, मर्जसॉर्ट: O(n log n)।",
      te: "సార్టింగ్ అల్గారిథమ్‌లు మూలకాలను క్రమంలో ఏర్పాటు చేస్తాయి. క్విక్‌సార్ట్: O(n log n) సగటు, మెర్జ్‌సార్ట్: O(n log n)."
    },
    "hash table": {
      en: "Hash Table: Maps keys to values using hash function. Average: O(1) insert/search/delete. Worst: O(n). Used in dictionaries.",
      hi: "हैश टेबल: हैश फंक्शन का उपयोग करके कुंजियों को मानों से जोड़ता है। औसतन: O(1)। शब्दकोश में उपयोग।",
      te: "హ్యాష్ టేబిల్: హ్యాష్ ఫంక్షన్ ఉపయోగించి కీలను విలువలకు మ్యాప్ చేస్తుంది. సగటు: O(1)."
    },
    "graph": {
      en: "Graph: Collection of vertices and edges. Types: Directed, Undirected, Weighted. Representations: Adjacency Matrix, Adjacency List.",
      hi: "ग्राफ: शीर्षों और किनारों का संग्रह। प्रकार: निर्देशित, अनिर्देशित, भारित। प्रतिनिधित्व: आसन्नता मैट्रिक्स।",
      te: "గ్రాఫ్: శీర్షాలు మరియు అంచుల సంకలనం. రకాలు: నిర్దేశిత, నిర్దేశితం కాని, బరువున్న."
    },
    "time complexity": {
      en: "Time Complexity: Measures how execution time grows. O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic, O(2ⁿ) exponential.",
      hi: "टाइम कॉम्प्लेक्सिटी: निष्पादन समय की वृद्धि को मापता है। O(1) स्थिर, O(log n) लॉगरिदमिक, O(n) रैखिक।",
      te: "టైమ్ కాంప్లెక్సిటీ: ఎక్సిక్యూషన్ సమయం ఎలా పెరుగుతుందో కొలుస్తుంది. O(1) స్థిరమైన, O(log n) లాగరిథమిక్."
    },
    "space complexity": {
      en: "Space Complexity: Measures memory usage relative to input size. Important for optimizing memory-constrained systems.",
      hi: "स्पेस कॉम्प्लेक्सिटी: इनपुट आकार के सापेक्ष मेमोरी उपयोग। सीमित मेमोरी में महत्वपूर्ण।",
      te: "స్పేస్ కాంప్లెక్సిటీ: ఇన్‌పుట్ సైజ్‌కు సంబంధించిన మెమరీ ఉపయోగం. మెమరీ పరిమితమైనప్పుడు ముఖ్యమైనది."
    }
  };
  
  const query = message.toLowerCase();
  let response = {
    en: "I can help with DSA topics like arrays, linked lists, stacks, queues, trees, sorting, searching, and more. What would you like to learn?",
    hi: "मैं डेटा संरचना और एल्गोरिदम के विषयों में मदद कर सकता हूँ। आप क्या सीखना चाहते हैं?",
    te: "నేను డేటా స్ట్రక్చర్‌ల్‌లు మరియు అల్గారిథమ్‌ల్‌లో సహాయం చేయగలను. మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?"
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

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
