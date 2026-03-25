import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";

import AILearningPlan from "./AILearningPlan";

function getStrength(score) {
  if (score >= 80) return "strong";
  if (score >= 50) return "average";
  return "weak";
}

export default function QuizAttempt({ quiz, onComplete }) {
  const { currentStudent, refreshUser } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  /* ===============================
     ANSWER SELECT
  ================================ */
  const handleSelectAnswer = (index) => {
    const updated = [...selectedAnswers];
    updated[currentQuestion] = index;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
    }
  };

  /* ===============================
     SUBMIT QUIZ
  ================================ */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Calculate score locally for display
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) correct++;
    });
    const scorePercentage = Math.round((correct / quiz.questions.length) * 100);

    try {
      // Submit to backend API — this updates topicScores on the User model
      const { default: api } = await import("../../utils/api");

      // Build answers payload: map local index answers to questionId + selectedAnswer
      const answers = quiz.questions.map((q, i) => ({
        questionId: q._id || q.id,
        selectedAnswer: selectedAnswers[i] ?? -1,
      }));

      await api.quizzes.submitAttempt(quiz._id || quiz.id, answers);

      // Refresh user profile so dashboard topicScores update immediately
      await refreshUser();

      setScoreData({ correct, scorePercentage });
      setShowResult(true);
    } catch (error) {
      console.error("Quiz submit error:", error);

      // Fallback: show result locally even if API fails
      setSubmitError(
        "Score saved locally only — could not reach the server. Dashboard may not reflect this attempt."
      );
      setScoreData({ correct, scorePercentage });
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===============================
     RESULT VIEW
  ================================ */
  if (showResult && scoreData) {
    const { correct, scorePercentage } = scoreData;
    const strength = getStrength(scorePercentage);
    const quizId = quiz._id || quiz.id;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-scale-in">
        {/* Score Card */}
        <div className="rounded-xl border p-8 text-center">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${strength === "strong"
              ? "gradient-success"
              : strength === "average"
                ? "bg-warning/20"
                : "bg-destructive/20"
              }`}
          >
            {strength === "strong" ? (
              <Trophy className="w-10 h-10 text-success-foreground" />
            ) : (
              <Target className="w-10 h-10 text-foreground" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-6">{quiz.title}</p>

          <div className="text-5xl font-bold mb-2">{scorePercentage}%</div>
          <p className="text-lg text-muted-foreground mb-2">
            {correct} out of {quiz.questions.length} correct
          </p>

          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2 mb-4">
              ⚠️ {submitError}
            </p>
          )}

          {!submitError && (
            <p className="text-sm text-success mb-6">
              ✓ Score saved — your dashboard has been updated!
            </p>
          )}
        </div>

        {/* AI Features */}
        <AILearningPlan quizId={quizId} />

        {/* ANSWER REVIEW */}
        <div className="border rounded-xl p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Answer Review</h3>

            {quiz.questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctAnswer;

              return (
                <div
                  key={q._id || q.id || i}
                  className={`p-4 rounded-lg border ${isCorrect
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{q.text}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer:{" "}
                        {q.options[selectedAnswers[i]] ?? "Not answered"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-success mt-1">
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  /* ===============================
     QUIZ VIEW
  ================================ */
  return (
    <div className="max-w-2xl mx-auto rounded-xl border animate-fade-in">
      <div className="p-6 border-b">
        <div className="flex justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {quiz.topic}
          </span>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <h3 className="text-xl font-semibold">{question.text}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full p-4 text-left rounded-xl border-2 ${selectedAnswers[currentQuestion] === index
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
            >
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={
                selectedAnswers.length !== quiz.questions.length ||
                isSubmitting
              }
              className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Submitting…" : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
