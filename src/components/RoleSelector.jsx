import { GraduationCap, ShieldCheck } from "lucide-react";

export default function RoleSelector({ onSelectRole }) {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            EduPath AI
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Smart Learning Assistant for Continuous Education
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student */}
          <div
            onClick={() => onSelectRole("student")}
            className="cursor-pointer group hover:scale-[1.02] transition-all duration-300 hover:shadow-glow bg-card/90 border rounded-2xl"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Student
              </h2>
              <p className="text-muted-foreground">
                Take quizzes, chat with AI tutor, track your progress, and get
                personalized learning paths
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  Quizzes
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  AI Chat
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  Progress
                </span>
              </div>
            </div>
          </div>

          {/* Admin */}
          <div
            onClick={() => onSelectRole("admin")}
            className="cursor-pointer group hover:scale-[1.02] transition-all duration-300 hover:shadow-glow bg-card/90 border rounded-2xl"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Admin
              </h2>
              <p className="text-muted-foreground">
                Create quizzes, manage questions, view student performance, and
                analyze learning analytics
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                  Manage
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                  Analytics
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                  Reports
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          Select your role to continue
        </p>
      </div>
    </div>
  );
}
