import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Target,
  GraduationCap,
  ChevronRight,
  Globe,
} from "lucide-react";

import StudentChat from "./StudentChat";
import QuizList from "./QuizList";
import LearningPathView from "./LearningPathView";
import ProgressCharts from "./ProgressCharts";

const LANGUAGES = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
};

export default function StudentDashboard() {
  const { user, logout, updateLanguage, currentStudent } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const student = currentStudent || {};

  const weakTopics =
    student.topicScores?.filter((t) => t.strength === "weak") || [];
  const strongTopics =
    student.topicScores?.filter((t) => t.strength === "strong") || [];
  const totalQuizzes =
    student.topicScores?.reduce((sum, t) => sum + t.totalAttempts, 0) || 0;

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <StudentChat />;
      case "quizzes":
        return <QuizList />;
      case "learning-path":
        return <LearningPathView />;
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={BookOpen}
                label="Total Quizzes"
                value={totalQuizzes}
                color="gradient-primary"
              />
              <StatCard
                icon={TrendingUp}
                label="Strong Topics"
                value={strongTopics.length}
                color="gradient-success"
              />
              <StatCard
                icon={Target}
                label="Weak Topics"
                value={weakTopics.length}
                color="bg-destructive/10"
              />
              <StatCard
                icon={GraduationCap}
                label="Topics Covered"
                value={student.topicScores?.length || 0}
                color="gradient-accent"
              />
            </div>

            {/* Charts */}
            <ProgressCharts topicScores={student.topicScores || []} />

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <ActionCard
                icon={MessageCircle}
                title="AI Tutor Chat"
                subtitle="Ask questions in your language"
                onClick={() => setActiveTab("chat")}
              />
              <ActionCard
                icon={BookOpen}
                title="Take Quiz"
                subtitle="Test your knowledge"
                onClick={() => setActiveTab("quizzes")}
              />
              <ActionCard
                icon={Target}
                title="Learning Path"
                subtitle="Your personalized journey"
                onClick={() => setActiveTab("learning-path")}
              />
            </div>

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <div className="border rounded-xl p-6 bg-destructive/5 border-destructive/30">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <Target className="w-5 h-5 text-destructive" />
                  Topics Needing Attention
                </h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {weakTopics.map((t) => (
                    <span
                      key={t.topic}
                      className="px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm"
                    >
                      {t.topic} ({t.averageScore}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold">EduPath AI</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <select
                  value={student.preferredLanguage || "en"}
                  onChange={(e) => updateLanguage(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {Object.entries(LANGUAGES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 mt-4">
            {[
              ["dashboard", "Dashboard", TrendingUp],
              ["chat", "AI Tutor", MessageCircle],
              ["quizzes", "Quizzes", BookOpen],
              ["learning-path", "Learning Path", Target],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  activeTab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="border rounded-xl p-6 hover:scale-[1.02] transition">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition group"
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
}
