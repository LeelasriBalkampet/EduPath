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

export default function ProgressCharts({ topicScores }) {
  if (!topicScores || topicScores.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-muted-foreground">
          No quiz data yet. Take some quizzes to see your progress!
        </p>
      </div>
    );
  }

  // Bar chart data
  const barData = topicScores.map((score) => ({
    name:
      score.topic.length > 12
        ? score.topic.slice(0, 12) + "..."
        : score.topic,
    fullName: score.topic,
    score: score.averageScore,
    attempts: score.totalAttempts,
  }));

  // Pie chart data
  const strengthCounts = {
    weak: topicScores.filter((t) => t.strength === "weak").length,
    average: topicScores.filter((t) => t.strength === "average").length,
    strong: topicScores.filter((t) => t.strength === "strong").length,
  };

  const pieData = [
    { name: "Weak", value: strengthCounts.weak, color: "hsl(0, 75%, 55%)" },
    { name: "Average", value: strengthCounts.average, color: "hsl(45, 95%, 50%)" },
    { name: "Strong", value: strengthCounts.strong, color: "hsl(160, 70%, 40%)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-2">
          Topic-wise Performance
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          Score:{" "}
                          <span className="font-medium text-foreground">
                            {data.score}%
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Attempts:{" "}
                          <span className="font-medium text-foreground">
                            {data.attempts}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="score"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-2">
          Performance Distribution
        </h3>

        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Topics:{" "}
                          <span className="font-medium text-foreground">
                            {data.value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
