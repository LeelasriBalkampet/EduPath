import { useState, useEffect } from "react";
import { BookOpen, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import QuizAttempt from "./QuizAttempt";

const STORAGE_KEY = "edupath_questions";

export default function QuizList() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  /* ===============================
     LOAD QUIZZES FROM LOCAL STORAGE
  ================================ */
  useEffect(() => {
    const loadQuizzes = () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setQuizzes([]);
        return;
      }

      const questions = JSON.parse(stored);
      const quizMap = {};

      questions.forEach((q) => {
        if (!quizMap[q.topic]) {
          quizMap[q.topic] = {
            id: `quiz-${q.topic}`,
            title: `${q.topic} Quiz`,
            topic: q.topic,
            difficulty: "easy",
            questions: [],
          };
        }
        quizMap[q.topic].questions.push(q);
      });

      // Set difficulty (highest priority)
      Object.values(quizMap).forEach((quiz) => {
        if (quiz.questions.some((q) => q.difficulty === "hard")) {
          quiz.difficulty = "hard";
        } else if (quiz.questions.some((q) => q.difficulty === "medium")) {
          quiz.difficulty = "medium";
        }
      });

      setQuizzes(Object.values(quizMap));
    };

    loadQuizzes();

    // Auto update when admin adds questions
    window.addEventListener("storage", loadQuizzes);
    return () => window.removeEventListener("storage", loadQuizzes);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/10 text-success border-success/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "hard":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  /* ===============================
     QUIZ ATTEMPT VIEW
  ================================ */
  if (selectedQuiz) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedQuiz(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </button>

        <QuizAttempt
          quiz={selectedQuiz}
          onComplete={() => setSelectedQuiz(null)}
        />
      </div>
    );
  }

  /* ===============================
     QUIZ LIST VIEW
  ================================ */
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Available Quizzes</h2>
        <p className="text-muted-foreground">
          Test your knowledge and track your progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => setSelectedQuiz(quiz)}
            className="group cursor-pointer rounded-xl border hover:scale-[1.02] transition-all"
          >
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(
                    quiz.difficulty
                  )}`}
                >
                  {quiz.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-3">
                {quiz.title}
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <span className="inline-block px-2 py-1 rounded-md bg-muted text-sm">
                {quiz.topic}
              </span>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {quiz.questions.length} questions
                </span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="p-12 text-center border rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Quizzes Available
          </h3>
          <p className="text-muted-foreground">
            The admin hasn't created any quizzes yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
