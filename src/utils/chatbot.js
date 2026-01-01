// ===============================
// DSA TERMINOLOGY KNOWLEDGE BASE
// ===============================

const DSA_DATA = [
  {
    keywords: ["data structure"],
    answer: {
      en: "A data structure is a way of organizing and storing data efficiently.",
      hi: "डेटा स्ट्रक्चर डेटा को व्यवस्थित और कुशल तरीके से संग्रहित करने की विधि है।",
      te: "డేటా స్ట్రక్చర్ అనేది డేటాను సమర్థవంతంగా నిర్వహించే విధానం."
    }
  },
  {
    keywords: ["algorithm"],
    answer: {
      en: "An algorithm is a step-by-step procedure to solve a problem.",
      hi: "एल्गोरिदम किसी समस्या को हल करने की चरणबद्ध प्रक्रिया है।",
      te: "అల్గోరిథం అనేది సమస్యను పరిష్కరించే దశల సమాహారం."
    }
  },
  {
    keywords: ["array"],
    answer: {
      en: "An array stores elements in contiguous memory locations.",
      hi: "ऐरे लगातार मेमोरी लोकेशन में डेटा स्टोर करता है।",
      te: "అర్రే అనేది సమీప మెమరీలో డేటాను నిల్వ చేస్తుంది."
    }
  },
  {
    keywords: ["linked list"],
    answer: {
      en: "A linked list is a collection of nodes connected using pointers.",
      hi: "लिंक्ड लिस्ट नोड्स का संग्रह है जो पॉइंटर द्वारा जुड़े होते हैं।",
      te: "లింక్డ్ లిస్ట్ అనేది నోడ్‌ల సమాహారం."
    }
  },
  {
    keywords: ["stack"],
    answer: {
      en: "Stack follows LIFO: Last In First Out.",
      hi: "स्टैक LIFO सिद्धांत पर काम करता है।",
      te: "స్టాక్ LIFO విధానాన్ని అనుసరిస్తుంది."
    }
  },
  {
    keywords: ["queue"],
    answer: {
      en: "Queue follows FIFO: First In First Out.",
      hi: "क्यू FIFO सिद्धांत पर काम करता है।",
      te: "క్యూ FIFO విధానాన్ని అనుసరిస్తుంది."
    }
  },
  {
    keywords: ["binary search"],
    answer: {
      en: "Binary search works on sorted arrays by dividing the search space.",
      hi: "बाइनरी सर्च सॉर्टेड ऐरे पर काम करता है।",
      te: "బైనరీ సెర్చ్ సార్టెడ్ అర్రేలో పనిచేస్తుంది."
    }
  },
  {
    keywords: ["time complexity"],
    answer: {
      en: "Time complexity measures how execution time grows with input size.",
      hi: "टाइम कॉम्प्लेक्सिटी समय वृद्धि को दर्शाती है।",
      te: "టైమ్ కాంప్లెక్సిటీ సమయ వృద్ధిని సూచిస్తుంది."
    }
  }
];

// ===============================
// RESPONSE GENERATOR
// ===============================

export function generateResponse(input, language = "en") {
  const q = input.toLowerCase();

  for (let item of DSA_DATA) {
    if (item.keywords.some(k => q.includes(k))) {
      return item.answer[language] || item.answer.en;
    }
  }

  return {
    en: "Sorry, I can answer only Data Structures and Algorithms questions.",
    hi: "माफ़ कीजिए, मैं केवल DSA से जुड़े प्रश्नों का उत्तर दे सकता हूँ।",
    te: "క్షమించండి, నేను DSA ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను."
  }[language];
}

// ===============================
// TEXT TO SPEECH
// ===============================

let utterance = null;

export function speak(text, language = "en") {
  if (!("speechSynthesis" in window)) return;

  stopSpeaking();
  utterance = new SpeechSynthesisUtterance(text);

  const map = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
  };

  utterance.lang = map[language] || "en-US";
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
