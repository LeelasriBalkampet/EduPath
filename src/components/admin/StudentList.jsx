import { useState, useEffect } from "react";
import {
  Search,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Plus,
  Link,
  BookOpen,
} from "lucide-react";
import api from "../../utils/api";
import ProgressCharts from "../student/ProgressCharts";
import { TOPICS } from "../../data/topics";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    title: "",
    url: "",
    topic: "",
    description: "",
  });
  const [addingResource, setAddingResource] = useState(false);

  /* ===============================
     LOAD STUDENTS FROM BACKEND API
  ================================ */
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.students.getAll();
      setStudents(data.students || []);
      // If a student is selected, update their data too
      if (selectedStudent) {
        const updated = data.students.find(s => s._id === selectedStudent._id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("Could not load students. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RESOURCES MANAGEMENT
  ================================ */
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.url || !resourceForm.topic) {
      alert("Please fill in title, url, and topic.");
      return;
    }

    setAddingResource(true);
    try {
      const response = await api.students.addResource(selectedStudent._id, resourceForm);
      setSelectedStudent(prev => ({
        ...prev,
        suggestedResources: response.suggestedResources
      }));
      setResourceForm({ title: "", url: "", topic: "", description: "" });
      alert("Resource suggested successfully!");
    } catch (err) {
      alert("Failed to add resource: " + (err.message || "Unknown error"));
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = async (resourceId) => {
    if (!window.confirm("Remove this suggestion?")) return;

    try {
      const response = await api.students.removeResource(selectedStudent._id, resourceId);
      setSelectedStudent(prev => ({
        ...prev,
        suggestedResources: response.suggestedResources
      }));
    } catch (err) {
      alert("Failed to remove resource: " + (err.message || "Unknown error"));
    }
  };

  /* ===============================
     DELETE STUDENT
  ================================ */
  const handleDelete = async (e, studentId) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    setDeletingId(studentId);
    try {
      await api.students.delete(studentId);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
      if (selectedStudent?._id === studentId) setSelectedStudent(null);
    } catch (err) {
      alert("Failed to delete student: " + (err.message || "Unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  /* ===============================
     HELPERS
  ================================ */
  const getOverallStrength = (student) => {
    if (!student.topicScores || student.topicScores.length === 0) return "new";
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

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===============================
     STUDENT DETAIL VIEW
  ================================ */
  if (selectedStudent) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
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
              {selectedStudent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
              <p className="text-muted-foreground">{selectedStudent.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}
              </p>
            </div>
            {getStrengthBadge(getOverallStrength(selectedStudent))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Topics Covered</p>
              <p className="text-2xl font-bold">
                {selectedStudent.topicScores?.length || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Weak Topics</p>
              <p className="text-2xl font-bold text-destructive">
                {selectedStudent.topicScores?.filter((t) => t.strength === "weak").length || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Strong Topics</p>
              <p className="text-2xl font-bold text-success">
                {selectedStudent.topicScores?.filter((t) => t.strength === "strong").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProgressCharts topicScores={selectedStudent.topicScores || []} />

            <div className="rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Topic Performance Details</h3>

              {selectedStudent.topicScores?.length > 0 ? (
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
                          {score.lastAttempt
                            ? new Date(score.lastAttempt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${score.strength === "strong"
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

          <div className="space-y-6">
            {/* Suggested Resources Section */}
            <div className="rounded-xl border p-6">
              <h3 className="flex items-center gap-2 font-semibold mb-6">
                <Link className="w-5 h-5 text-primary" />
                Suggest Practice Resources
              </h3>

              {/* Add Resource Form */}
              <form onSubmit={handleAddResource} className="space-y-4 mb-8 p-4 bg-muted/20 rounded-xl border border-dashed">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Resource Title</label>
                    <input
                      className="w-full p-2 text-sm border rounded bg-background"
                      placeholder="e.g. Master Binary Search - YouTube"
                      value={resourceForm.title}
                      onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Topic</label>
                    <select
                      className="w-full p-2 text-sm border rounded bg-background"
                      value={resourceForm.topic}
                      onChange={e => setResourceForm({ ...resourceForm, topic: e.target.value })}
                    >
                      <option value="">Select Topic</option>
                      {TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">URL</label>
                    <input
                      className="w-full p-2 text-sm border rounded bg-background"
                      placeholder="https://..."
                      value={resourceForm.url}
                      onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                    <textarea
                      className="w-full p-2 text-sm border rounded bg-background resize-none"
                      rows={2}
                      placeholder="What should the student focus on in this resource?"
                      value={resourceForm.description}
                      onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingResource}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {addingResource ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Suggestion
                </button>
              </form>

              {/* Resources List */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  Current Suggestions ({selectedStudent.suggestedResources?.length || 0})
                </h4>

                {selectedStudent.suggestedResources?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.suggestedResources.map((res) => (
                      <div key={res._id} className="p-4 rounded-xl border bg-background group hover:border-primary/30 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {res.topic}
                            </span>
                            <h5 className="font-semibold mt-1 flex items-center gap-1.5 underline decoration-primary/30 underline-offset-4">
                              {res.title}
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </h5>
                          </div>
                          <button
                            onClick={() => handleRemoveResource(res._id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {res.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {res.description}
                          </p>
                        )}
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-primary/70 truncate block hover:text-primary transition"
                        >
                          {res.url}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-xl">
                    <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No resources suggested yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     LOADING / ERROR STATES
  ================================ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading students…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/30 bg-destructive/5 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchStudents}
            className="text-sm text-primary underline mt-1"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     STUDENT LIST VIEW
  ================================ */
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">
            {students.length} registered student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="text-sm px-3 py-1.5 border rounded hover:bg-muted transition"
        >
          Refresh
        </button>
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
            student.topicScores?.length > 0
              ? Math.round(
                student.topicScores.reduce((sum, t) => sum + t.averageScore, 0) /
                student.topicScores.length
              )
              : null;

          return (
            <div
              key={student._id}
              className="rounded-xl border p-6 cursor-pointer hover:scale-[1.02] transition-all relative group"
              onClick={() => setSelectedStudent(student)}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, student._id)}
                disabled={deletingId === student._id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                title="Delete student"
              >
                {deletingId === student._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{student.name}</h3>
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
                    {student.topicScores?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Topics</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">
                    {student.topicScores?.filter((t) => t.strength === "strong").length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Strong</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-destructive">
                    {student.topicScores?.filter((t) => t.strength === "weak").length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Weak</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="p-12 text-center border rounded-xl">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "No students match your search" : "No students registered yet"}
          </p>
        </div>
      )}
    </div>
  );
}
