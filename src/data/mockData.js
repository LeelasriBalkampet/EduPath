import { TOPICS } from "./topics";

/* ================= ADMINS ================= */

export const mockAdmins = [
  {
    id: "admin-1",
    email: "admin@edupath.com",
    name: "Dr. Rajesh Kumar",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

/* ================= STUDENTS ================= */

export const mockStudents = [
  {
    id: "student-1",
    email: "rahul@student.com",
    name: "Rahul Sharma",
    role: "student",
    createdAt: "2024-01-15T00:00:00Z",
    preferredLanguage: "en",
    quizHistory: [],
    topicScores: [
      {
        topic: "Data Structures",
        totalAttempts: 5,
        averageScore: 45,
        strength: "weak",
        lastAttempt: "2024-03-10",
      },
      {
        topic: "Algorithms",
        totalAttempts: 3,
        averageScore: 72,
        strength: "strong",
        lastAttempt: "2024-03-08",
      },
      {
        topic: "Database Management",
        totalAttempts: 4,
        averageScore: 58,
        strength: "average",
        lastAttempt: "2024-03-05",
      },
      {
        topic: "Computer Networks",
        totalAttempts: 2,
        averageScore: 40,
        strength: "weak",
        lastAttempt: "2024-03-01",
      },
    ],
  },
  {
    id: "student-2",
    email: "priya@student.com",
    name: "Priya Patel",
    role: "student",
    createdAt: "2024-02-01T00:00:00Z",
    preferredLanguage: "hi",
    quizHistory: [],
    topicScores: [
      {
        topic: "Data Structures",
        totalAttempts: 8,
        averageScore: 85,
        strength: "strong",
        lastAttempt: "2024-03-12",
      },
      {
        topic: "Machine Learning",
        totalAttempts: 2,
        averageScore: 35,
        strength: "weak",
        lastAttempt: "2024-03-10",
      },
      {
        topic: "Web Development",
        totalAttempts: 6,
        averageScore: 78,
        strength: "strong",
        lastAttempt: "2024-03-08",
      },
    ],
  },
  {
    id: "student-3",
    email: "amit@student.com",
    name: "Amit Reddy",
    role: "student",
    createdAt: "2024-02-15T00:00:00Z",
    preferredLanguage: "te",
    quizHistory: [],
    topicScores: [
      {
        topic: "Operating Systems",
        totalAttempts: 4,
        averageScore: 62,
        strength: "average",
        lastAttempt: "2024-03-11",
      },
      {
        topic: "Software Engineering",
        totalAttempts: 3,
        averageScore: 55,
        strength: "average",
        lastAttempt: "2024-03-09",
      },
    ],
  },
];

/* ================= QUESTIONS ================= */

export const mockQuestions = [
  {
    id: "q1",
    text: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    topic: "Algorithms",
    difficulty: "easy",
    createdBy: "admin-1",
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "q2",
    text: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    topic: "Data Structures",
    difficulty: "easy",
    createdBy: "admin-1",
    createdAt: "2024-01-21T00:00:00Z",
  },
  {
    id: "q3",
    text: "What does ACID stand for in database transactions?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Addition, Consistency, Isolation, Data",
      "Atomicity, Completeness, Integrity, Durability",
      "Access, Control, Integrity, Database",
    ],
    correctAnswer: 0,
    topic: "Database Management",
    difficulty: "medium",
    createdBy: "admin-1",
    createdAt: "2024-01-22T00:00:00Z",
  },
];

/* ================= QUIZZES ================= */

export const mockQuizzes = [
  {
    id: "quiz-1",
    title: "Algorithms Fundamentals",
    topic: "Algorithms",
    difficulty: "easy",
    questions: mockQuestions.filter((q) => q.topic === "Algorithms"),
    createdBy: "admin-1",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "quiz-2",
    title: "Data Structures Basics",
    topic: "Data Structures",
    difficulty: "easy",
    questions: mockQuestions.filter((q) => q.topic === "Data Structures"),
    createdBy: "admin-1",
    createdAt: "2024-02-05T00:00:00Z",
  },
];

/* ================= QUIZ ATTEMPTS ================= */

export const mockQuizAttempts = [];

/* ================= HELPERS ================= */

export function getStrength(score) {
  if (score < 50) return "weak";
  if (score <= 70) return "average";
  return "strong";
}

export function addQuestion(question) {
  mockQuestions.push(question);
}

export function updateQuestion(id, updates) {
  const index = mockQuestions.findIndex((q) => q.id === id);
  if (index !== -1) {
    mockQuestions[index] = {
      ...mockQuestions[index],
      ...updates,
    };
  }
}

export function deleteQuestion(id) {
  const index = mockQuestions.findIndex((q) => q.id === id);
  if (index !== -1) {
    mockQuestions.splice(index, 1);
  }
}

export function addQuizAttempt(attempt) {
  mockQuizAttempts.push(attempt);

  const student = mockStudents.find(
    (s) => s.id === attempt.studentId
  );

  if (!student) return;

  const topicScore = student.topicScores.find(
    (t) => t.topic === attempt.topic
  );

  if (topicScore) {
    const newTotal = topicScore.totalAttempts + 1;
    const newAvg =
      (topicScore.averageScore * topicScore.totalAttempts +
        attempt.score) /
      newTotal;

    topicScore.totalAttempts = newTotal;
    topicScore.averageScore = Math.round(newAvg);
    topicScore.strength = getStrength(newAvg);
    topicScore.lastAttempt = attempt.completedAt;
  } else {
    student.topicScores.push({
      topic: attempt.topic,
      totalAttempts: 1,
      averageScore: attempt.score,
      strength: getStrength(attempt.score),
      lastAttempt: attempt.completedAt,
    });
  }
}
