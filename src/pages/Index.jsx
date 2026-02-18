import { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import RoleSelector from "@/components/RoleSelector";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import StudentDashboard from "@/components/student/StudentDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import LandingPage from "@/components/LandingPage";


function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [view, setView] = useState("landing"); // landing, role-selector, login, register
  const [selectedRole, setSelectedRole] = useState(null);

  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <AdminDashboard />;
    }
    return <StudentDashboard />;
  }

  // Navigation Logic
  const handleGetStarted = () => {
    setSelectedRole("student");
    setView("register");
  };

  const handleLogin = () => {
    setView("role-selector");
  };

  const handleBackToLanding = () => {
    setView("landing");
    setSelectedRole(null);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setView("login");
  };

  // Render according to view state
  switch (view) {
    case "landing":
      return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;

    case "role-selector":
      return <RoleSelector onSelectRole={handleRoleSelect} onBack={handleBackToLanding} />;

    case "register":
      return (
        <RegisterForm
          onBack={handleBackToLanding}
          onLoginClick={() => setView("login")}
          onSuccess={() => { }}
        />
      );

    case "login":
      return (
        <LoginForm
          role={selectedRole}
          onBack={() => setView("role-selector")}
          onSuccess={() => { }}
          onRegister={
            selectedRole === "student" ? () => setView("register") : undefined
          }
        />
      );

    default:
      return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
