import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  ShieldCheck,
  Plus,
} from "lucide-react";

import QuestionManager from "./QuestionManager";
import StudentList from "./StudentList";
import AdminAnalytics from "./AdminAnalytics";
import { mockStudents, mockQuestions, mockQuizzes } from "../../data/mockData";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "questions":
        return <QuestionManager />;
      case "students":
        return <StudentList />;
      case "analytics":
        return <AdminAnalytics />;
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Users,
                  label: "Total Students",
                  value: mockStudents.length,
                  bg: "gradient-primary",
                },
                {
                  icon: BookOpen,
                  label: "Total Quizzes",
                  value: mockQuizzes.length,
                  bg: "gradient-accent",
                },
                {
                  icon: BarChart3,
                  label: "Total Questions",
                  value: mockQuestions.length,
                  bg: "gradient-success",
                },
                {
                  icon: Settings,
                  label: "Topics",
                  value: new Set(mockQuestions.map((q) => q.topic)).size,
                  bg: "bg-muted",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-6 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6">
                <h3 className="flex items-center gap-2 font-semibold mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Question Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and manage quiz questions across different
                  topics and difficulty levels.
                </p>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2"
                  onClick={() => setActiveTab("questions")}
                >
                  <Plus className="w-4 h-4" />
                  Manage Questions
                </button>
              </div>

              <div className="rounded-xl border p-6">
                <h3 className="flex items-center gap-2 font-semibold mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  Student Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  View all registered students, their quiz history, and
                  performance analytics.
                </p>
                <button
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground"
                  onClick={() => setActiveTab("students")}
                >
                  View Students
                </button>
              </div>
            </div>

            {/* Recent Students */}
            <div className="rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Recent Students</h3>
              <div className="space-y-4">
                {mockStudents.slice(0, 5).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {student.topicScores.length} topics
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {
                          student.topicScores.filter(
                            (t) => t.strength === "weak"
                          ).length
                        }{" "}
                        weak
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 mt-4 -mb-4 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "questions", label: "Questions", icon: BookOpen },
              { id: "students", label: "Students", icon: Users },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg ${
                  activeTab === tab.id
                    ? "bg-background text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
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
