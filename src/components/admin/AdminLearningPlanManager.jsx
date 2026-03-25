import { useState, useEffect } from "react";
import {
    Search,
    Eye,
    Trash2,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    X,
    ExternalLink,
    BookOpen,
    User,
    Loader2
} from "lucide-react";
import api from "../../utils/api";

export default function AdminLearningPlanManager() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getAllLearningPlans();
            setPlans(data.plans || []);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (planId) => {
        setViewingPlan(true);
        try {
            const data = await api.ai.getLearningPlanById(planId);
            setSelectedPlanDetails(data.plan);
        } catch (err) {
            console.error("Failed to fetch plan details:", err);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this learning plan? This cannot be undone.")) return;

        setDeleteLoading(planId);
        try {
            await api.ai.deleteLearningPlan(planId);
            setPlans(plans.filter(p => p.id !== planId));
        } catch (err) {
            alert("Failed to delete plan");
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.weakTopics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Completed</span>;
            case 'needs_review':
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"><AlertCircle className="w-3 h-3" /> Needs Review</span>;
            default:
                return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="w-3 h-3" /> In Progress</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Learning Plan Management</h2>
                    <p className="text-muted-foreground text-sm">Monitor and oversee all student-generated AI learning plans.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by student or topic..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-sm">Student</th>
                                <th className="p-4 font-semibold text-sm">Topics</th>
                                <th className="p-4 font-semibold text-sm">Status</th>
                                <th className="p-4 font-semibold text-sm">Generated</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-48 bg-muted rounded" /></td>
                                        <td className="p-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                                        <td className="p-4 text-right"><div className="h-8 w-20 bg-muted rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredPlans.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No learning plans found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                                    {plan.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{plan.studentName}</p>
                                                    <p className="text-xs text-muted-foreground">{plan.studentEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {plan.weakTopics.map((topic, i) => (
                                                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md border">{topic}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">{getStatusBadge(plan.status)}</td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            {new Date(plan.generatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(plan.id)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                disabled={deleteLoading === plan.id}
                                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Plan"
                                            >
                                                {deleteLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {viewingPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-background rounded-2xl border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between gradient-primary text-primary-foreground">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Detailed Learning Plan
                                </h3>
                                {selectedPlanDetails && (
                                    <p className="text-sm opacity-90">Student: {selectedPlanDetails.userId?.name || selectedPlanDetails.studentName}</p>
                                )}
                            </div>
                            <button
                                onClick={() => { setViewingPlan(false); setSelectedPlanDetails(null); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {!selectedPlanDetails ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Loading plan details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl border bg-muted/30">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Status</p>
                                            <div className="font-semibold">{getStatusBadge(selectedPlanDetails.status)}</div>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/30">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Quiz Score</p>
                                            <p className="text-lg font-bold">{selectedPlanDetails.score}%</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/30">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Generated On</p>
                                            <p className="text-lg font-bold">{new Date(selectedPlanDetails.generatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* 5-Day Tracker (Read-only) */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            5-Day Curriculum
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedPlanDetails.learningPlan.map((day) => (
                                                <div key={day.day} className={`p-4 rounded-xl border transition-all ${day.completed ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="font-bold text-sm">Day {day.day}: {day.activity}</h5>
                                                        {day.completed && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">DONE</span>}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {day.resources.map((res, i) => (
                                                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
                                                                <span className="flex items-center gap-2">
                                                                    {res.completed ? <CheckCircle className="w-3 h-3 text-primary" /> : <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />}
                                                                    {res.title}
                                                                </span>
                                                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-primary">
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Confidence & Extra Resources */}
                                    {selectedPlanDetails.confidenceLevel && (
                                        <div className="p-6 rounded-2xl bg-accent text-accent-foreground">
                                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Student Self-Assessment
                                            </h4>
                                            <p className="text-sm mb-4 capitalize">
                                                Student felt <strong>{selectedPlanDetails.confidenceLevel.replace('_', ' ')}</strong> after completing this plan.
                                            </p>
                                            {selectedPlanDetails.additionalResources?.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-xs font-bold uppercase opacity-80">System Recommended Extra Resources:</p>
                                                    <div className="grid gap-2">
                                                        {selectedPlanDetails.additionalResources.map((res, i) => (
                                                            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                                                                <div className="text-sm line-clamp-1">{res.title}</div>
                                                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t bg-muted/50 flex justify-end">
                            <button
                                onClick={() => { setViewingPlan(false); setSelectedPlanDetails(null); }}
                                className="px-6 py-2 rounded-xl bg-background border font-medium hover:bg-muted transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
