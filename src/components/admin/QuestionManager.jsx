import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { TOPICS } from "../../data/topics";

/* ===============================
   LOCAL STORAGE KEY
================================ */
const STORAGE_KEY = "edupath_questions";

/* ===============================
   HELPERS
================================ */
const loadQuestions = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveQuestions = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* ===============================
   COMPONENT
================================ */
export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    topic: "",
    difficulty: "easy",
  });

  /* ===============================
     LOAD QUESTIONS
  ================================ */
  useEffect(() => {
    setQuestions(loadQuestions());
  }, []);

  const resetForm = () => {
    setFormData({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      topic: "",
      difficulty: "easy",
    });
    setEditingQuestion(null);
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({ ...question });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (
      !formData.text.trim() ||
      !formData.topic ||
      formData.options.some((o) => !o.trim())
    ) {
      alert("Please fill all fields and select correct answer");
      return;
    }

    let updatedQuestions;

    if (editingQuestion) {
      updatedQuestions = questions.map((q) =>
        q.id === editingQuestion.id ? { ...formData, id: q.id } : q
      );
    } else {
      updatedQuestions = [
        ...questions,
        {
          id: `q-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTopic = filterTopic === "all" || q.topic === filterTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Question Management</h2>
          <p className="text-muted-foreground">
            Create and manage quiz questions
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl w-full max-w-2xl">
            <h3 className="font-bold mb-4">
              {editingQuestion ? "Edit Question" : "Create Question"}
            </h3>

            <textarea
              className="w-full p-2 border rounded mb-3"
              placeholder="Question text"
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                className="p-2 border rounded"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              >
                <option value="">Select topic</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                className="p-2 border rounded"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* OPTIONS + CORRECT ANSWER */}
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === i}
                  onChange={() =>
                    setFormData({ ...formData, correctAnswer: i })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => {
                    const opts = [...formData.options];
                    opts[i] = e.target.value;
                    setFormData({ ...formData, options: opts });
                  }}
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
                onClick={handleSubmit}
              >
                {editingQuestion ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 p-2 border rounded"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="p-2 border rounded"
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
        >
          <option value="all">All Topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="border rounded-xl p-4">
            <p className="font-medium mb-2">{q.text}</p>

            {q.options.map((o, i) => (
              <div
                key={i}
                className={`p-2 rounded mb-1 ${
                  i === q.correctAnswer
                    ? "bg-success/10 text-success"
                    : "bg-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}. {o}
              </div>
            ))}

            <div className="flex gap-3 mt-3">
              <button onClick={() => handleOpenDialog(q)}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(q.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <p className="text-center text-muted-foreground">
            No questions found
          </p>
        )}
      </div>
    </div>
  );
}
