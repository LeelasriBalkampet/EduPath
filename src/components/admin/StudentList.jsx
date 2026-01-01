import { useState } from "react";
import {
  Search,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
} from "lucide-react";

import { mockStudents } from "../../data/mockData";
import ProgressCharts from "../student/ProgressCharts";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOverallStrength = (student) => {
    if (student.topicScores.length === 0) return "new";
    const avg =
      student.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
      student.topicScores.length;
    if (avg >= 70) return "strong";
    if (avg >= 50) return "average";
    return "weak";
  };

  const getStrengthBadge = (strength) => {
    switch (strength) {
      case "strong":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-success/10 text-success border border-success/20">
            <TrendingUp className="w-3 h-3" /> Strong
          </span>
        );
      case "average":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-warning/10 text-warning border border-warning/20">
            <Minus className="w-3 h-3" /> Average
          </span>
        );
      case "weak":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-destructive/10 text-destructive border border-destructive/20">
            <TrendingDown className="w-3 h-3" /> Weak
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-1 text-xs rounded border">
            New
          </span>
        );
    }
  };

  // ------------------ STUDENT DETAIL VIEW ------------------
  if (selectedStudent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setSelectedStudent(null)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {selectedStudent.name}
              </h2>
              <p className="text-muted-foreground">
                {selectedStudent.email}
              </p>
            </div>
            {getStrengthBadge(getOverallStrength(selectedStudent))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Topics Covered</p>
              <p className="text-2xl font-bold">
                {selectedStudent.topicScores.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Weak Topics</p>
              <p className="text-2xl font-bold text-destructive">
                {
                  selectedStudent.topicScores.filter(
                    (t) => t.strength === "weak"
                  ).length
                }
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Strong Topics</p>
              <p className="text-2xl font-bold text-success">
                {
                  selectedStudent.topicScores.filter(
                    (t) => t.strength === "strong"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <ProgressCharts topicScores={selectedStudent.topicScores} />

        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-4">
            Topic Performance Details
          </h3>

          {selectedStudent.topicScores.length > 0 ? (
            <div className="space-y-4">
              {selectedStudent.topicScores.map((score) => (
                <div
                  key={score.topic}
                  className="flex items-center justify-between p-4 rounded-xl border"
                >
                  <div>
                    <p className="font-medium">{score.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {score.totalAttempts} attempts • Last:{" "}
                      {new Date(score.lastAttempt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        score.strength === "strong"
                          ? "text-success"
                          : score.strength === "average"
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {score.averageScore}%
                    </p>
                    {getStrengthBadge(score.strength)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No quiz attempts yet
            </p>
          )}
        </div>
      </div>
    );
  }

  // ------------------ STUDENT LIST VIEW ------------------
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Student Management</h2>
        <p className="text-muted-foreground">
          View and manage registered students
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 p-2 border rounded"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const strength = getOverallStrength(student);
          const avgScore =
            student.topicScores.length > 0
              ? Math.round(
                  student.topicScores.reduce(
                    (sum, t) => sum + t.averageScore,
                    0
                  ) / student.topicScores.length
                )
              : null;

          return (
            <div
              key={student.id}
              className="rounded-xl border p-6 cursor-pointer hover:scale-[1.02] transition-all"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {student.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {getStrengthBadge(strength)}
                    {avgScore !== null && (
                      <span className="text-sm text-muted-foreground">
                        Avg: {avgScore}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {student.topicScores.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Topics
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">
                    {
                      student.topicScores.filter(
                        (t) => t.strength === "strong"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Strong
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-destructive">
                    {
                      student.topicScores.filter(
                        (t) => t.strength === "weak"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Weak
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center border rounded-xl">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No students found
          </p>
        </div>
      )}
    </div>
  );
}
