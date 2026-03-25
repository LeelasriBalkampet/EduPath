import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Loader2,
    Sparkles,
} from "lucide-react";
import api from "../../utils/api";

export default function SkillGapAnalysis({ quizId, score, onClose }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.ai.skillGapAnalysis(quizId);
            setAnalysis(data.recommendation);
        } catch (err) {
            setError(err.message || "Failed to generate analysis");
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <div className="border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">AI Skill Gap Analysis</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Get a personalized analysis of your strengths, weaknesses, and areas to focus on.
                    </p>
                    <button
                        onClick={generateAnalysis}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate Skill Analysis
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Analyzing your skills with AI...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border rounded-xl p-6 bg-destructive/5 border-destructive/30">
                <p className="text-destructive font-medium">⚠️ {error}</p>
                <button
                    onClick={generateAnalysis}
                    className="mt-3 px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="gradient-primary p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary-foreground" />
                        <h3 className="text-lg font-bold text-primary-foreground">
                            Skill Analysis Report
                        </h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <span className="text-primary-foreground font-bold text-xl">
                            {analysis.score}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Strong Areas */}
                {analysis.skillAnalysis.strongAreas?.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-success mb-3">
                            <TrendingUp className="w-5 h-5" />
                            Strong Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.skillAnalysis.strongAreas.map((area, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm border border-success/20"
                                >
                                    • {area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weak Areas */}
                {analysis.skillAnalysis.weakAreas?.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-destructive mb-3">
                            <TrendingDown className="w-5 h-5" />
                            Weak Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.skillAnalysis.weakAreas.map((area, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm border border-destructive/20"
                                >
                                    • {area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Focus */}
                {analysis.skillAnalysis.recommendedFocus?.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-primary mb-3">
                            <Target className="w-5 h-5" />
                            Recommended Focus
                        </h4>
                        <ul className="space-y-2">
                            {analysis.skillAnalysis.recommendedFocus.map((rec, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm p-3 rounded-lg bg-primary/5 border border-primary/10"
                                >
                                    <span className="text-primary font-bold mt-0.5">→</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}
