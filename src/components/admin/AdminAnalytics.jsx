import { mockStudents, mockQuestions, mockQuizzes } from "../../data/mockData";
import { TOPICS } from "../../data/topics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminAnalytics() {
  // Topic-wise average scores
  const topicAverages = TOPICS.map((topic) => {
    let totalScore = 0;
    let count = 0;

    mockStudents.forEach((student) => {
      const topicScore = student.topicScores.find(
        (t) => t.topic === topic
      );
      if (topicScore) {
        totalScore += topicScore.averageScore;
        count++;
      }
    });

    return {
      topic: topic.length > 15 ? topic.slice(0, 15) + "..." : topic,
      fullTopic: topic,
      averageScore: count > 0 ? Math.round(totalScore / count) : 0,
      studentCount: count,
    };
  }).filter((t) => t.studentCount > 0);

  // Student performance distribution
  const performanceDistribution = {
    excellent: mockStudents.filter((s) => {
      if (!s.topicScores.length) return false;
      const avg =
        s.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
        s.topicScores.length;
      return avg >= 80;
    }).length,

    good: mockStudents.filter((s) => {
      if (!s.topicScores.length) return false;
      const avg =
        s.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
        s.topicScores.length;
      return avg >= 60 && avg < 80;
    }).length,

    average: mockStudents.filter((s) => {
      if (!s.topicScores.length) return false;
      const avg =
        s.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
        s.topicScores.length;
      return avg >= 40 && avg < 60;
    }).length,

    needsWork: mockStudents.filter((s) => {
      if (!s.topicScores.length) return false;
      const avg =
        s.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
        s.topicScores.length;
      return avg < 40;
    }).length,
  };

  const pieData = [
    { name: "Excellent (80%+)", value: performanceDistribution.excellent, color: "hsl(160, 70%, 40%)" },
    { name: "Good (60-80%)", value: performanceDistribution.good, color: "hsl(200, 80%, 45%)" },
    { name: "Average (40-60%)", value: performanceDistribution.average, color: "hsl(45, 95%, 50%)" },
    { name: "Needs Work (<40%)", value: performanceDistribution.needsWork, color: "hsl(0, 75%, 55%)" },
  ].filter((d) => d.value > 0);

  // Question difficulty
  const difficultyData = [
    { name: "Easy", count: mockQuestions.filter((q) => q.difficulty === "easy").length, color: "hsl(160, 70%, 40%)" },
    { name: "Medium", count: mockQuestions.filter((q) => q.difficulty === "medium").length, color: "hsl(45, 95%, 50%)" },
    { name: "Hard", count: mockQuestions.filter((q) => q.difficulty === "hard").length, color: "hsl(0, 75%, 55%)" },
  ];

  // Weak topics
  const weakTopicsCount = {};
  mockStudents.forEach((student) => {
    student.topicScores.forEach((score) => {
      if (score.strength === "weak") {
        weakTopicsCount[score.topic] =
          (weakTopicsCount[score.topic] || 0) + 1;
      }
    });
  });

  const weakTopicsData = Object.entries(weakTopicsCount)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Overall performance metrics and insights
        </p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: mockStudents.length },
          { label: "Active Quizzes", value: mockQuizzes.length },
          { label: "Questions Bank", value: mockQuestions.length },
          { label: "Topics Needing Attention", value: weakTopicsData.length },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border p-6 text-center">
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Topic-wise Average Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicAverages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="topic" width={120} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Student Performance Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
