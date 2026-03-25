import { useState } from "react";
import {
    HelpCircle,
    Loader2,
    Sparkles,
    ChevronDown,
    Eye,
    EyeOff,
} from "lucide-react";
import api from "../../utils/api";
import { TOPICS } from "../../data/topics";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function PracticeQuestions() {
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [revealedAnswers, setRevealedAnswers] = useState({});

    const handleGenerate = async () => {
        if (!topic || !difficulty) return;

        setLoading(true);
        setError(null);
        setQuestions(null);
        setRevealedAnswers({});

        try {
            const data = await api.ai.generatePracticeQuestions(topic, difficulty);
            setQuestions(data);
        } catch (err) {
            setError(err.message || "Failed to generate questions");
        } finally {
            setLoading(false);
        }
    };

    const toggleAnswer = (index) => {
        setRevealedAnswers((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Form */}
            <div className="border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Practice Question Generator</h2>
                        <p className="text-muted-foreground text-sm">
                            Select a topic and difficulty to generate AI-powered practice questions with answers
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* Topic Select */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Topic</label>
                        <div className="relative">
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Select a topic...</option>
                                {TOPICS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Difficulty Select */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition ${difficulty === d
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!topic || !difficulty || loading}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Questions...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Generate Practice Questions
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="border rounded-xl p-4 bg-destructive/5 border-destructive/30">
                    <p className="text-destructive text-sm">⚠️ {error}</p>
                </div>
            )}

            {/* Questions */}
            {questions && (
                <div className="border rounded-xl overflow-hidden animate-fade-in">
                    <div className="gradient-primary p-5">
                        <h3 className="text-lg font-bold text-primary-foreground">
                            Practice Questions – {questions.topic}
                        </h3>
                        <p className="text-primary-foreground/70 text-sm">
                            Difficulty: {questions.difficulty} • {questions.questions?.length || 0} questions
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        {questions.questions?.map((q, i) => {
                            const item = typeof q === "string" ? { question: q, answer: null } : q;
                            const isRevealed = revealedAnswers[i];

                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border overflow-hidden"
                                >
                                    {/* Question */}
                                    <div className="p-4 bg-muted/20">
                                        <div className="flex items-start gap-3">
                                            <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm leading-relaxed pt-1 flex-1">
                                                {item.question}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Answer Toggle */}
                                    {item.answer && (
                                        <>
                                            <button
                                                onClick={() => toggleAnswer(i)}
                                                className="w-full px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 border-t hover:bg-muted/30 transition text-primary"
                                            >
                                                {isRevealed ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4" />
                                                        Hide Answer
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        Show Answer
                                                    </>
                                                )}
                                            </button>

                                            {isRevealed && (
                                                <div className="px-4 py-3 bg-success/5 border-t border-success/20 animate-fade-in">
                                                    <p className="text-sm text-success font-medium mb-1">Answer:</p>
                                                    <p className="text-sm leading-relaxed">{item.answer}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
