import { useState } from "react";
import {
    Calendar,
    Loader2,
    Sparkles,
    CheckCircle,
    ExternalLink,
    Play,
    FileText,
    Code,
} from "lucide-react";
import api from "../../utils/api";

const RESOURCE_ICONS = {
    video: Play,
    article: FileText,
    practice: Code,
};

const DAY_COLORS = [
    "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    "from-amber-500/10 to-amber-600/5 border-amber-500/20",
    "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    "from-rose-500/10 to-rose-600/5 border-rose-500/20",
];

const DAY_ICONS = [
    "text-blue-500",
    "text-purple-500",
    "text-amber-500",
    "text-emerald-500",
    "text-rose-500",
];

export default function AILearningPlan({ quizId, onClose }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [planDays, setPlanDays] = useState(5);

    const generatePlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.ai.generateLearningPlan(quizId, planDays);
            setPlan(data.plan);
        } catch (err) {
            setError(err.message || "Failed to generate learning plan");
        } finally {
            setLoading(false);
        }
    };

    if (!plan && !loading) {
        return (
            <div className="border rounded-xl p-6 bg-gradient-to-br from-accent/5 to-primary/5">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-accent flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">AI Learning Plan</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Generate a personalized learning plan based on your quiz results.
                    </p>
                    <div className="flex items-center justify-center gap-4 mx-auto max-w-sm mb-6">
                        <label className="text-sm font-medium">Plan Duration:</label>
                        <select 
                            className="border rounded-lg px-3 py-1.5 bg-background text-sm cursor-pointer outline-none focus:ring-2 focus:ring-primary/50"
                            value={planDays}
                            onChange={(e) => setPlanDays(Number(e.target.value))}
                        >
                            <option value={3}>3 Days</option>
                            <option value={5}>5 Days</option>
                            <option value={7}>7 Days</option>
                            <option value={10}>10 Days</option>
                            <option value={14}>14 Days</option>
                            <option value={30}>30 Days</option>
                        </select>
                    </div>
                    {error && <p className="text-destructive text-sm mb-3">⚠️ {error}</p>}
                    <button
                        onClick={generatePlan}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate Learning Plan
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Creating your learning plan...</p>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="gradient-accent p-6">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-white" />
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {plan.learningPlan?.length ? `${plan.learningPlan.length}-Day Learning Plan` : "AI Learning Plan"}
                        </h3>
                        <p className="text-white/70 text-sm">
                            Focus: {plan.weakTopics?.join(", ")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                    💡 Go to the <strong>Learning Path</strong> tab to track your daily progress with resource checkboxes!
                </p>

                {plan.learningPlan?.map((item, i) => {
                    const resources = item.resources || [];

                    return (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border bg-gradient-to-r ${DAY_COLORS[i] || DAY_COLORS[0]} flex items-start gap-4`}
                        >
                            <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0 font-bold ${DAY_ICONS[i] || DAY_ICONS[0]}`}>
                                {item.day}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Day {item.day}</p>
                                <p className="text-muted-foreground text-sm mt-1">{item.activity}</p>

                                {resources.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {resources.map((res, ri) => {
                                            const ResIcon = RESOURCE_ICONS[res.type] || ExternalLink;
                                            return (
                                                <a
                                                    key={ri}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition"
                                                >
                                                    <ResIcon className="w-3 h-3" />
                                                    <span className="truncate">{res.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <CheckCircle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-1" />
                        </div>
                    );
                })}

                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition mt-2"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}
