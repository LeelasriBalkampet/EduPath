import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react";
import { TOPICS } from "../../data/topics";
import api from "../../utils/api";

/* ===============================
   BLANK QUESTION TEMPLATE
================================ */
const blankQuestion = () => ({
  text: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  difficulty: "medium",
});

/* ===============================
   BLANK QUIZ TEMPLATE
================================ */
const blankQuiz = () => ({
  title: "",
  topic: "",
  difficulty: "medium",
  questions: [blankQuestion()],
});

/* ===============================
   MAIN COMPONENT
================================ */
export default function QuestionManager() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null); // null = create mode
  const [formData, setFormData] = useState(blankQuiz());

  /* ===============================
     LOAD QUIZZES FROM BACKEND
  ================================ */
  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.quizzes.getAll();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  /* ===============================
     OPEN DIALOG
  ================================ */
  const openCreate = () => {
    setEditingQuiz(null);
    setFormData(blankQuiz());
    setIsDialogOpen(true);
  };

  const openEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        text: q.text || q.question || "",
        options: q.options || ["", "", "", ""],
        correctAnswer: q.correctAnswer ?? 0,
        difficulty: q.difficulty || "medium",
      })),
    });
    setIsDialogOpen(true);
  };

  /* ===============================
     FORM HELPERS
  ================================ */
  const updateQuestion = (qIdx, field, value) => {
    const qs = [...formData.questions];
    qs[qIdx] = { ...qs[qIdx], [field]: value };
    setFormData({ ...formData, questions: qs });
  };

  const updateOption = (qIdx, optIdx, value) => {
    const qs = [...formData.questions];
    const opts = [...qs[qIdx].options];
    opts[optIdx] = value;
    qs[qIdx] = { ...qs[qIdx], options: opts };
    setFormData({ ...formData, questions: qs });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, blankQuestion()],
    });
  };

  const removeQuestion = (qIdx) => {
    if (formData.questions.length === 1) return; // keep at least 1
    const qs = formData.questions.filter((_, i) => i !== qIdx);
    setFormData({ ...formData, questions: qs });
  };

  /* ===============================
     SAVE (CREATE / UPDATE)
  ================================ */
  const handleSave = async () => {
    // Validate
    if (!formData.title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    if (!formData.topic) {
      alert("Please select a topic.");
      return;
    }
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} text is empty.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        alert(`All options for question ${i + 1} must be filled.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        topic: formData.topic,
        difficulty: formData.difficulty,
        questions: formData.questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
        })),
      };

      if (editingQuiz) {
        await api.quizzes.update(editingQuiz._id, payload);
      } else {
        await api.quizzes.create(payload);
      }

      setIsDialogOpen(false);
      await fetchQuizzes(); // refresh list
    } catch (err) {
      alert("Failed to save quiz: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     DELETE QUIZ
  ================================ */
  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await api.quizzes.delete(quizId);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      if (expandedQuiz === quizId) setExpandedQuiz(null);
    } catch (err) {
      alert("Failed to delete quiz: " + (err.message || "Unknown error"));
    }
  };

  /* ===============================
     FILTER
  ================================ */
  const filtered = quizzes.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTopic = filterTopic === "all" || q.topic === filterTopic;
    return matchSearch && matchTopic;
  });

  const difficultyColor = (d) => {
    if (d === "easy") return "text-green-600 bg-green-50 border-green-200";
    if (d === "medium") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-muted-foreground">
            Create and manage quizzes with questions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Add Quiz
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={fetchQuizzes} className="ml-auto text-sm text-primary underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 p-2 border rounded"
            placeholder="Search quizzes..."
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
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Quiz list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading quizzes…
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border rounded-xl text-muted-foreground">
          {searchTerm || filterTopic !== "all"
            ? "No quizzes match your search"
            : "No quizzes yet. Click \"Add Quiz\" to create one."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quiz) => {
            const isOpen = expandedQuiz === quiz._id;
            return (
              <div key={quiz._id} className="border rounded-xl overflow-hidden">
                {/* Quiz header */}
                <div className="flex items-center justify-between p-4 hover:bg-muted/20">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => setExpandedQuiz(isOpen ? null : quiz._id)}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">{quiz.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {quiz.topic}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border capitalize ${difficultyColor(quiz.difficulty)}`}
                        >
                          {quiz.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {quiz.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openEdit(quiz)}
                      className="p-2 rounded hover:bg-muted transition"
                      title="Edit quiz"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2 rounded hover:bg-destructive/10 transition"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Questions preview */}
                {isOpen && (
                  <div className="border-t divide-y bg-muted/10">
                    {quiz.questions?.map((q, idx) => (
                      <div key={q._id || idx} className="px-6 py-4">
                        <p className="font-medium text-sm mb-3">
                          <span className="text-muted-foreground mr-2">Q{idx + 1}.</span>
                          {q.text || q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${optIdx === q.correctAnswer
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-background border-border text-muted-foreground"
                                }`}
                            >
                              {optIdx === q.correctAnswer && (
                                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              )}
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =====================
          CREATE / EDIT DIALOG
      ===================== */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-background rounded-xl w-full max-w-3xl shadow-xl">
            {/* Dialog header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold">
                {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-2 rounded hover:bg-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quiz meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium mb-1">Quiz Title *</label>
                  <input
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Operating Systems Basics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic *</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    <option value="">Select topic</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    Questions ({formData.questions.length})
                  </h4>
                  <button
                    onClick={addQuestion}
                    className="text-sm px-3 py-1.5 border rounded hover:bg-muted transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="border rounded-xl p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {qIdx + 1}
                      </span>
                      {formData.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIdx)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <textarea
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={2}
                      placeholder="Enter question text..."
                      value={q.text}
                      onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => updateQuestion(qIdx, "correctAnswer", optIdx)}
                            title="Mark as correct answer"
                            className="accent-green-600"
                          />
                          <input
                            className={`flex-1 p-2 border rounded text-sm ${q.correctAnswer === optIdx
                                ? "border-green-400 bg-green-50"
                                : ""
                              }`}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ☝ Select the radio button next to the correct answer
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialog footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                className="px-4 py-2 border rounded hover:bg-muted transition"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingQuiz ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
