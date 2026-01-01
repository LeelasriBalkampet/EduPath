import { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function LoginForm({ role, onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const isAdmin = role === "admin";
  const Icon = isAdmin ? ShieldCheck : GraduationCap;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password, role);

      if (success) {
        alert(`Logged in successfully as ${role}`);
        onSuccess();
      } else {
        alert(
          isAdmin
            ? "Invalid admin credentials.\nTry: admin@edupath.com / admin123"
            : "Invalid credentials.\nTry: rahul@student.com / student123"
        );
      }
    } catch {
      alert("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/95 border rounded-2xl p-6 animate-scale-in relative">
        {/* Back */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-accent/10"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isAdmin ? "gradient-accent" : "gradient-primary"
            }`}
          >
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="text-2xl font-bold">
            {isAdmin ? "Admin Login" : "Student Login"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? "Access the admin dashboard"
              : "Start your personalized learning journey"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {isAdmin ? "Admin Email" : "Student Email"}
            </label>
            <input
              type="email"
              placeholder={
                isAdmin
                  ? "admin@edupath.com"
                  : "your.email@student.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 text-white ${
              isAdmin ? "bg-accent" : "bg-primary"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        
        
      </div>
    </div>
  );
}
