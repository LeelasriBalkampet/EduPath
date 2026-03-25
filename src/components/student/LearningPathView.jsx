import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TOPICS } from "../../data/topics";
import api from "../../utils/api";
import {
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  Loader2,
  Play,
  FileText,
  Code,
  Lock,
  ThumbsUp,
  Meh,
  ThumbsDown,
  X,
} from "lucide-react";

const RESOURCE_ICONS = {
  video: Play,
  article: FileText,
  practice: Code,
};

export default function LearningPathView() {
  const { currentStudent, refreshUser } = useAuth();
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [aiPlanError, setAiPlanError] = useState(null);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [confidenceLoading, setConfidenceLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [planDays, setPlanDays] = useState(5);

  useEffect(() => {
    refreshUser();
    loadHistory();
  }, [refreshUser]);

  const topicScores = currentStudent?.topicScores || [];
  const suggestedResources = currentStudent?.suggestedResources || [];

  const weakTopics = topicScores
    .filter((t) => t.strength === "weak")
    .map((t) => t.topic);
  const attemptedTopics = topicScores.map((t) => t.topic);
  const newTopics = TOPICS.filter((t) => !attemptedTopics.includes(t));

  // ---------- Load all plans (History) ----------
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.ai.getAllLearningPlans();
      setAllPlans(data.plans || []);

      // Auto-select latest if none selected
      if (data.plans?.length > 0 && !selectedPlanId) {
        selectPlan(data.plans[0].id);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setInitialLoadDone(true);
      setHistoryLoading(false);
    }
  };

  // ---------- Select a specific plan ----------
  const selectPlan = async (planId) => {
    if (planId === selectedPlanId && aiPlan) return;

    setAiPlanLoading(true);
    setSelectedPlanId(planId);
    try {
      const data = await api.ai.getLearningPlanById(planId);
      setAiPlan(data.plan);
    } catch (err) {
      console.error("Failed to fetch plan details:", err);
      setAiPlanError("Could not load the selected plan.");
    } finally {
      setAiPlanLoading(false);
    }
  };

  // ---------- Generate new plan ----------
  const generateAIPlan = async () => {
    setAiPlanLoading(true);
    setAiPlanError(null);
    try {
      const attemptsData = await api.quizzes.getAttempts(currentStudent?._id);
      const attempts = attemptsData.attempts || [];

      if (!attempts || attempts.length === 0) {
        setAiPlanError("Take a quiz first to generate an AI learning plan.");
        setAiPlanLoading(false);
        return;
      }

      const latestAttempt = attempts[0];
      if (!latestAttempt) {
        setAiPlanError("Could not find your latest quiz results.");
        setAiPlanLoading(false);
        return;
      }

      const quizId = latestAttempt.quizId?._id || latestAttempt.quizId;
      if (!quizId) {
        setAiPlanError("Quiz information is missing. Try retaking the quiz.");
        setAiPlanLoading(false);
        return;
      }

      const data = await api.ai.generateLearningPlan(quizId, planDays);
      setAiPlan(data.plan);
      setSelectedPlanId(data.plan.id);
      loadHistory(); // Refresh the list
    } catch (err) {
      setAiPlanError(err.message || "Failed to generate learning plan");
    } finally {
      setAiPlanLoading(false);
    }
  };

  // ---------- Toggle resource completion ----------
  const toggleResource = async (dayNumber, resourceIndex, currentCompleted) => {
    if (!aiPlan?.id) return;

    // Check if day is unlocked
    if (!isDayUnlocked(dayNumber)) return;

    try {
      const data = await api.ai.markResourceComplete(
        aiPlan.id,
        dayNumber,
        resourceIndex,
        !currentCompleted
      );
      setAiPlan((prev) => ({
        ...prev,
        learningPlan: data.plan.learningPlan,
        status: data.plan.status,
      }));

      // Show confidence modal when plan is completed
      if (data.plan.status === "completed" && !aiPlan.confidenceLevel) {
        setTimeout(() => setShowConfidenceModal(true), 500);
      }

      // Refresh history list if status might have changed
      if (allDone || data.plan.status === 'completed') {
        loadHistory();
      }
    } catch (err) {
      console.error("Failed to update resource:", err);
    }
  };

  // ---------- Submit confidence ----------
  const submitConfidence = async (level) => {
    if (!aiPlan?.id) return;
    setConfidenceLoading(true);
    try {
      const data = await api.ai.submitConfidence(aiPlan.id, level);
      setAiPlan((prev) => ({
        ...prev,
        confidenceLevel: data.plan.confidenceLevel,
        status: data.plan.status,
        additionalResources: data.plan.additionalResources || [],
      }));
      setShowConfidenceModal(false);
      loadHistory(); // Refresh history to update status badge
    } catch (err) {
      console.error("Failed to submit confidence:", err);
    } finally {
      setConfidenceLoading(false);
    }
  };

  // ---------- Helpers ----------
  const isDayUnlocked = (dayNumber) => {
    if (dayNumber === 1) return true;
    const prevDay = aiPlan?.learningPlan?.find((d) => d.day === dayNumber - 1);
    return prevDay?.completed === true;
  };

  const getTotalResources = () => {
    if (!aiPlan?.learningPlan) return { total: 0, completed: 0 };
    let total = 0, completed = 0;
    aiPlan.learningPlan.forEach((d) => {
      (d.resources || []).forEach((r) => {
        total++;
        if (r.completed) completed++;
      });
    });
    return { total, completed };
  };

  const { total: totalResources, completed: completedResources } = getTotalResources();
  const progressPercent = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

  const generateLearningSteps = () => {
    const steps = [];
    weakTopics.forEach((topic) => {
      steps.push({ topic, action: "Review and practice", priority: "high", reason: "Your score is below 50%" });
    });
    topicScores
      .filter((t) => t.strength === "average")
      .forEach((t) => {
        steps.push({ topic: t.topic, action: "Strengthen understanding", priority: "medium", reason: `Current score: ${t.averageScore}%` });
      });
    newTopics.slice(0, 3).forEach((topic) => {
      steps.push({ topic, action: "Start learning", priority: "low", reason: "Not yet attempted" });
    });
    return steps;
  };

  const learningSteps = generateLearningSteps();

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return { badge: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle, line: "bg-destructive" };
      case "medium":
        return { badge: "bg-warning/10 text-warning border-warning/20", icon: TrendingUp, line: "bg-warning" };
      default:
        return { badge: "bg-primary/10 text-primary border-primary/20", icon: BookOpen, line: "bg-primary" };
    }
  };

  const DAY_COLORS = [
    "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    "from-amber-500/10 to-amber-600/5 border-amber-500/20",
    "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    "from-rose-500/10 to-rose-600/5 border-rose-500/20",
  ];

  const DAY_ICONS_COLOR = [
    "text-blue-500",
    "text-purple-500",
    "text-amber-500",
    "text-emerald-500",
    "text-rose-500",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Your Learning Path</h2>
        <p className="text-muted-foreground">
          Personalized recommendations based on your quiz performance
        </p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weak Topics</p>
              <p className="text-2xl font-bold text-destructive">{weakTopics.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-warning/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-warning">
                {topicScores.filter((t) => t.strength === "average").length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New to Explore</p>
              <p className="text-2xl font-bold text-primary">{newTopics.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Your Learning Plans (History) ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Your Learning Plans
          </h2>
          {allPlans.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {allPlans.length} plans total
            </span>
          )}
        </div>

        {historyLoading ? (
          <div className="flex items-center gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-48 h-24 bg-muted rounded-xl" />
            ))}
          </div>
        ) : allPlans.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20">
            {allPlans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const date = new Date(plan.generatedAt).toLocaleDateString();

              return (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan.id)}
                  className={`flex-shrink-0 w-56 p-4 rounded-xl border text-left transition-all hover:shadow-md
                    ${isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                      ${plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                        plan.status === 'needs_review' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'}`}>
                      {plan.status.replace('_', ' ')}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{date}</span>
                  </div>
                  <h4 className="text-sm font-bold line-clamp-1 mb-1">
                    {plan.weakTopics?.join(", ") || "General Plan"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Quiz Score: {plan.score}%
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-8 text-center border border-dashed">
            <p className="text-muted-foreground text-sm">No learning plans generated yet.</p>
          </div>
        )}
      </div>

      {/* ==================== AI 5-Day Learning Plan ==================== */}
      <div className="rounded-xl border overflow-hidden">
        <div className="gradient-accent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  {aiPlan?.learningPlan?.length ? `AI ${aiPlan.learningPlan.length}-Day Learning Plan` : "AI Learning Plan"}
                </h3>
                <p className="text-white/70 text-sm">
                  {aiPlan?.weakTopics?.length
                    ? `Focus: ${aiPlan.weakTopics.join(", ")}`
                    : "Personalized daily plan with resources to improve weak areas"}
                </p>
              </div>
            </div>
            {aiPlan && (
              <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1.5">
                <span className="text-white font-bold text-sm">
                  {progressPercent}% complete
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Generate Button (no plan yet) */}
          {!aiPlan && !aiPlanLoading && initialLoadDone && (
            <div className="text-center py-4">
              {aiPlanError ? (
                <p className="text-destructive text-sm mb-4">⚠️ {aiPlanError}</p>
              ) : (
                <p className="text-muted-foreground text-sm mb-4">
                  Generate an AI-powered learning plan based on your quiz results
                </p>
              )}
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
              <button
                onClick={generateAIPlan}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate Learning Plan
              </button>
            </div>
          )}

          {/* Loading */}
          {aiPlanLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground text-sm">Creating your personalized plan...</p>
            </div>
          )}

          {/* Plan Content */}
          {aiPlan && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {completedResources}/{totalResources} resources • {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Day Cards */}
              {aiPlan.learningPlan?.map((item, i) => {
                const unlocked = isDayUnlocked(item.day);
                const isCompleted = item.completed;
                const resources = item.resources || [];

                return (
                  <div
                    key={i}
                    className={`rounded-xl border overflow-hidden transition-all bg-gradient-to-r ${DAY_COLORS[i] || DAY_COLORS[0]} ${!unlocked ? "opacity-50" : ""
                      } ${isCompleted ? "ring-2 ring-success/30" : ""}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Day Number / Status */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition ${isCompleted
                            ? "bg-success text-white"
                            : !unlocked
                              ? "bg-muted text-muted-foreground"
                              : `bg-background ${DAY_ICONS_COLOR[i] || DAY_ICONS_COLOR[0]}`
                            }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : !unlocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            item.day
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${isCompleted ? "line-through" : ""}`}>
                              Day {item.day}
                            </p>
                            {isCompleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                                Completed ✓
                              </span>
                            )}
                            {!unlocked && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                🔒 Complete Day {item.day - 1} first
                              </span>
                            )}
                          </div>
                          <p className={`text-muted-foreground text-sm mt-1 ${isCompleted ? "line-through" : ""}`}>
                            {item.activity}
                          </p>

                          {/* Resources with checkboxes */}
                          {resources.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {resources.map((res, ri) => {
                                const ResIcon = RESOURCE_ICONS[res.type] || ExternalLink;
                                return (
                                  <div
                                    key={ri}
                                    className={`flex items-center gap-2 p-2 rounded-lg border transition group text-sm ${res.completed
                                      ? "bg-success/5 border-success/30"
                                      : unlocked
                                        ? "bg-background/80 hover:border-primary/50 cursor-pointer"
                                        : "bg-muted/30 border-muted"
                                      }`}
                                  >
                                    {/* Checkbox */}
                                    <button
                                      onClick={() => toggleResource(item.day, ri, res.completed)}
                                      disabled={!unlocked}
                                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition ${res.completed
                                        ? "bg-success border-success text-white"
                                        : unlocked
                                          ? "border-muted-foreground/30 hover:border-primary"
                                          : "border-muted-foreground/20"
                                        }`}
                                    >
                                      {res.completed && <CheckCircle className="w-3 h-3" />}
                                    </button>

                                    <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                      <ResIcon className="w-3.5 h-3.5 text-primary" />
                                    </div>

                                    <a
                                      href={unlocked ? res.url : undefined}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                                      className={`truncate flex-1 transition-colors ${res.completed ? "line-through text-muted-foreground" : "group-hover:text-primary"
                                        }`}
                                    >
                                      {res.title}
                                    </a>

                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                                      {res.type}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Confidence Result Banner */}
              {aiPlan.confidenceLevel && (
                <div className={`rounded-xl border p-4 ${aiPlan.confidenceLevel === "very_confident"
                  ? "bg-success/5 border-success/30"
                  : aiPlan.confidenceLevel === "somewhat_confident"
                    ? "bg-warning/5 border-warning/30"
                    : "bg-destructive/5 border-destructive/30"
                  }`}>
                  <p className="text-sm font-medium">
                    {aiPlan.confidenceLevel === "very_confident" && "🎉 Great! You feel very confident about these topics!"}
                    {aiPlan.confidenceLevel === "somewhat_confident" && "👍 You're getting there — keep practicing!"}
                    {aiPlan.confidenceLevel === "not_confident" && "📚 Don't worry! Here are some additional resources to help you:"}
                  </p>
                </div>
              )}

              {/* Additional Resources (for not confident) */}
              {aiPlan.additionalResources?.length > 0 && (
                <div className="rounded-xl border p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Additional Resources to Strengthen Your Understanding
                  </h4>
                  <div className="space-y-2">
                    {aiPlan.additionalResources.map((res, i) => {
                      const ResIcon = RESOURCE_ICONS[res.type] || ExternalLink;
                      return (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 transition group"
                        >
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ResIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{res.title}</p>
                            {res.description && <p className="text-xs text-muted-foreground truncate">{res.description}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">{res.type}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Regenerate */}
              <div className="flex flex-col items-center gap-3 mt-6 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground font-medium text-xs">New Plan Duration:</span>
                  <select 
                    className="border rounded-lg px-2 py-1 bg-background text-xs cursor-pointer outline-none focus:ring-2 focus:ring-primary/50"
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
                <button
                  onClick={generateAIPlan}
                  disabled={aiPlanLoading}
                  className="w-full py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition flex items-center justify-center gap-1 border border-primary/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate New Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Confidence Modal ==================== */}
      {showConfidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background rounded-2xl border shadow-xl max-w-md w-full p-8 relative animate-scale-in">
            <button
              onClick={() => setShowConfidenceModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-accent flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learning Plan Completed! 🎉</h3>
              <p className="text-muted-foreground text-sm">
                How confident do you feel about this topic?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => submitConfidence("not_confident")}
                disabled={confidenceLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-destructive/30 hover:bg-destructive/5 transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ThumbsDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Not confident</p>
                  <p className="text-xs text-muted-foreground">I need more resources and practice</p>
                </div>
              </button>

              <button
                onClick={() => submitConfidence("somewhat_confident")}
                disabled={confidenceLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-warning/30 hover:bg-warning/5 transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Meh className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Somewhat confident</p>
                  <p className="text-xs text-muted-foreground">I understand the basics but need more practice</p>
                </div>
              </button>

              <button
                onClick={() => submitConfidence("very_confident")}
                disabled={confidenceLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-success/30 hover:bg-success/5 transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ThumbsUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Very confident</p>
                  <p className="text-xs text-muted-foreground">I've mastered these topics</p>
                </div>
              </button>
            </div>

            {confidenceLoading && (
              <div className="mt-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Processing...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Learning Steps ==================== */}
      <div className="rounded-xl border p-6">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <Target className="w-5 h-5 text-primary" />
          Recommended Learning Steps
          <span className="text-[10px] font-normal text-muted-foreground ml-2">Click a topic to see resources</span>
        </h3>

        {learningSteps.length > 0 ? (
          <div className="space-y-4">
            {learningSteps.map((step, index) => {
              const styles = getPriorityStyles(step.priority);
              const Icon = styles.icon;
              const isExpanded = expandedTopic === step.topic;
              const topicResources = suggestedResources.filter(r => r.topic === step.topic);

              return (
                <div key={`${step.topic}-${index}`} className="relative">
                  {index < learningSteps.length - 1 && (
                    <div className={`absolute left-6 top-14 w-0.5 h-8 ${styles.line} opacity-30`} />
                  )}
                  <div
                    onClick={() => setExpandedTopic(isExpanded ? null : step.topic)}
                    className={`flex flex-col rounded-xl border transition-all cursor-pointer ${isExpanded ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/30"
                      }`}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.priority === "high" ? "bg-destructive/10"
                        : step.priority === "medium" ? "bg-warning/10" : "bg-primary/10"
                        }`}>
                        <Icon className={`w-6 h-6 ${step.priority === "high" ? "text-destructive"
                          : step.priority === "medium" ? "text-warning" : "text-primary"
                          }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{step.topic}</h4>
                          <span className={`text-xs px-2 py-1 rounded border ${styles.badge}`}>
                            {step.priority} priority
                          </span>
                          {topicResources.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {topicResources.length} expert resources
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.action}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{step.reason}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Circle className="w-5 h-5 text-muted-foreground" />
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t bg-muted/20 rounded-b-xl animate-fade-in">
                        {topicResources.length > 0 ? (
                          <div className="space-y-3 mt-4">
                            <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expert Recommended Resources</h5>
                            {topicResources.map((res) => (
                              <a
                                key={res._id}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 transition group"
                              >
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <ExternalLink className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{res.title}</p>
                                  {res.description && <p className="text-xs text-muted-foreground truncate">{res.description}</p>}
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-muted-foreground">No specific expert resources yet. <br />Take a quiz on this topic to get AI-recommended resources!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">Great Progress!</h3>
            <p className="text-muted-foreground">
              You're doing well in all topics. Keep exploring new subjects!
            </p>
          </div>
        )}
      </div>

      {/* Topic Breakdown */}
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Topic Performance Breakdown</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {topicScores.map((score) => (
            <div
              key={score.topic}
              className={`p-4 rounded-xl border ${score.strength === "strong" ? "border-success/30 bg-success/5"
                : score.strength === "average" ? "border-warning/30 bg-warning/5"
                  : "border-destructive/30 bg-destructive/5"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{score.topic}</span>
                <span className={`text-sm font-bold ${score.strength === "strong" ? "text-success"
                  : score.strength === "average" ? "text-warning" : "text-destructive"
                  }`}>
                  {score.averageScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${score.strength === "strong" ? "gradient-success"
                    : score.strength === "average" ? "bg-warning" : "bg-destructive"
                    }`}
                  style={{ width: `${score.averageScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {score.totalAttempts} attempt{score.totalAttempts > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
