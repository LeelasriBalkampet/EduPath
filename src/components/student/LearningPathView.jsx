import { useAuth } from "../../context/AuthContext";
import { TOPICS } from "../../data/topics";
import {
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function LearningPathView() {
  const { currentStudent } = useAuth();

  const topicScores = currentStudent?.topicScores || [];

  // Weak topics
  const weakTopics = topicScores
    .filter((t) => t.strength === "weak")
    .map((t) => t.topic);

  // New topics
  const attemptedTopics = topicScores.map((t) => t.topic);
  const newTopics = TOPICS.filter((t) => !attemptedTopics.includes(t));

  const generateLearningSteps = () => {
    const steps = [];

    // Priority 1: Weak topics
    weakTopics.forEach((topic) => {
      steps.push({
        topic,
        action: "Review and practice",
        priority: "high",
        completed: false,
        reason: "Your score is below 50%",
      });
    });

    // Priority 2: Average topics
    topicScores
      .filter((t) => t.strength === "average")
      .forEach((t) => {
        steps.push({
          topic: t.topic,
          action: "Strengthen understanding",
          priority: "medium",
          completed: false,
          reason: `Current score: ${t.averageScore}%`,
        });
      });

    // Priority 3: New topics
    newTopics.slice(0, 3).forEach((topic) => {
      steps.push({
        topic,
        action: "Start learning",
        priority: "low",
        completed: false,
        reason: "Not yet attempted",
      });
    });

    return steps;
  };

  const learningSteps = generateLearningSteps();

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return {
          badge: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertTriangle,
          line: "bg-destructive",
        };
      case "medium":
        return {
          badge: "bg-warning/10 text-warning border-warning/20",
          icon: TrendingUp,
          line: "bg-warning",
        };
      default:
        return {
          badge: "bg-primary/10 text-primary border-primary/20",
          icon: BookOpen,
          line: "bg-primary",
        };
    }
  };

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
              <p className="text-2xl font-bold text-destructive">
                {weakTopics.length}
              </p>
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
              <p className="text-2xl font-bold text-primary">
                {newTopics.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Steps */}
      <div className="rounded-xl border p-6">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <Target className="w-5 h-5 text-primary" />
          Recommended Learning Steps
        </h3>

        {learningSteps.length > 0 ? (
          <div className="space-y-4">
            {learningSteps.map((step, index) => {
              const styles = getPriorityStyles(step.priority);
              const Icon = styles.icon;

              return (
                <div key={`${step.topic}-${index}`} className="relative">
                  {index < learningSteps.length - 1 && (
                    <div
                      className={`absolute left-6 top-14 w-0.5 h-8 ${styles.line} opacity-30`}
                    />
                  )}

                  <div className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/30">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        step.priority === "high"
                          ? "bg-destructive/10"
                          : step.priority === "medium"
                          ? "bg-warning/10"
                          : "bg-primary/10"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          step.priority === "high"
                            ? "text-destructive"
                            : step.priority === "medium"
                            ? "text-warning"
                            : "text-primary"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{step.topic}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded border ${styles.badge}`}
                        >
                          {step.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.action}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {step.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Great Progress!
            </h3>
            <p className="text-muted-foreground">
              You're doing well in all topics. Keep exploring new subjects!
            </p>
          </div>
        )}
      </div>

      {/* Topic Breakdown */}
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold mb-4">
          Topic Performance Breakdown
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {topicScores.map((score) => (
            <div
              key={score.topic}
              className={`p-4 rounded-xl border ${
                score.strength === "strong"
                  ? "border-success/30 bg-success/5"
                  : score.strength === "average"
                  ? "border-warning/30 bg-warning/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{score.topic}</span>
                <span
                  className={`text-sm font-bold ${
                    score.strength === "strong"
                      ? "text-success"
                      : score.strength === "average"
                      ? "text-warning"
                      : "text-destructive"
                  }`}
                >
                  {score.averageScore}%
                </span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    score.strength === "strong"
                      ? "gradient-success"
                      : score.strength === "average"
                      ? "bg-warning"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${score.averageScore}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {score.totalAttempts} attempt
                {score.totalAttempts > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
