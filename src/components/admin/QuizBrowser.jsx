import { useState, useEffect } from "react";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    CheckCircle,
    Loader2,
    AlertCircle,
    ArrowLeft,
    HelpCircle,
    Tag,
} from "lucide-react";
import api from "../../utils/api";

export default function QuizBrowser({ onBack }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Which topic is expanded
    const [expandedTopic, setExpandedTopic] = useState(null);
    // Which quiz is expanded (to show questions)
    const [expandedQuiz, setExpandedQuiz] = useState(null);

    /* ===============================
       FETCH ALL QUIZZES
    ================================ */
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.quizzes.getAll();
                setQuizzes(data.quizzes || []);
            } catch (err) {
                setError("Failed to load quizzes. Make sure the backend is running.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    /* ===============================
       GROUP BY TOPIC
    ================================ */
    const topicMap = quizzes.reduce((acc, quiz) => {
        const topic = quiz.topic || "Uncategorized";
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(quiz);
        return acc;
    }, {});

    const topics = Object.entries(topicMap).sort(([a], [b]) =>
        a.localeCompare(b)
    );

    const difficultyColor = (d) => {
        if (d === "easy") return "text-green-600 bg-green-50 border-green-200";
        if (d === "medium") return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    /* ===============================
       LOADING / ERROR
    ================================ */
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading quizzes…
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-destructive/30 bg-destructive/5 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    /* ===============================
       RENDER
    ================================ */
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </button>
            </div>

            <div>
                <h2 className="text-2xl font-bold">Quiz Browser</h2>
                <p className="text-muted-foreground">
                    {topics.length} topic{topics.length !== 1 ? "s" : ""} •{" "}
                    {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
                </p>
            </div>

            {topics.length === 0 && (
                <div className="p-12 text-center border rounded-xl">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No quizzes created yet</p>
                </div>
            )}

            {/* Topic list */}
            <div className="space-y-3">
                {topics.map(([topic, topicQuizzes]) => {
                    const isTopicOpen = expandedTopic === topic;
                    const totalQuestions = topicQuizzes.reduce(
                        (sum, q) => sum + (q.questions?.length || 0),
                        0
                    );

                    return (
                        <div key={topic} className="border rounded-xl overflow-hidden">
                            {/* Topic header — click to expand */}
                            <button
                                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition text-left"
                                onClick={() => {
                                    setExpandedTopic(isTopicOpen ? null : topic);
                                    setExpandedQuiz(null);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base">{topic}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {topicQuizzes.length} quiz{topicQuizzes.length !== 1 ? "zes" : ""} •{" "}
                                            {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                {isTopicOpen ? (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>

                            {/* Quizzes under this topic */}
                            {isTopicOpen && (
                                <div className="border-t divide-y bg-muted/10">
                                    {topicQuizzes.map((quiz) => {
                                        const isQuizOpen = expandedQuiz === quiz._id;

                                        return (
                                            <div key={quiz._id}>
                                                {/* Quiz row — click to expand questions */}
                                                <button
                                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition text-left"
                                                    onClick={() =>
                                                        setExpandedQuiz(isQuizOpen ? null : quiz._id)
                                                    }
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium">{quiz.title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span
                                                                    className={`text-xs px-2 py-0.5 rounded border capitalize ${difficultyColor(
                                                                        quiz.difficulty
                                                                    )}`}
                                                                >
                                                                    {quiz.difficulty}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {quiz.questions?.length || 0} questions
                                                                </span>
                                                                {quiz.timeLimit && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        • {quiz.timeLimit} min
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isQuizOpen ? (
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                </button>

                                                {/* Questions list */}
                                                {isQuizOpen && (
                                                    <div className="px-6 pb-4 space-y-3 bg-background border-t">
                                                        {quiz.questions?.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                                                No questions in this quiz
                                                            </p>
                                                        ) : (
                                                            quiz.questions?.map((q, idx) => (
                                                                <div
                                                                    key={q._id || idx}
                                                                    className="mt-3 p-4 rounded-xl border bg-muted/20"
                                                                >
                                                                    <p className="font-medium text-sm mb-3">
                                                                        <span className="text-muted-foreground mr-2">
                                                                            Q{idx + 1}.
                                                                        </span>
                                                                        {q.question}
                                                                    </p>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        {q.options?.map((opt, optIdx) => (
                                                                            <div
                                                                                key={optIdx}
                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${optIdx === q.correctAnswer
                                                                                        ? "bg-green-50 border-green-200 text-green-700"
                                                                                        : "bg-background border-border text-muted-foreground"
                                                                                    }`}
                                                                            >
                                                                                {optIdx === q.correctAnswer && (
                                                                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                                                                )}
                                                                                <span>
                                                                                    {String.fromCharCode(65 + optIdx)}.{" "}
                                                                                    {opt}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {q.explanation && (
                                                                        <p className="mt-3 text-xs text-muted-foreground border-t pt-2">
                                                                            <span className="font-medium">
                                                                                Explanation:
                                                                            </span>{" "}
                                                                            {q.explanation}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
