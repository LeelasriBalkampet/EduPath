import { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import RoleSelector from "@/components/RoleSelector";
import LoginForm from "@/components/LoginForm";
import StudentDashboard from "@/components/student/StudentDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";


function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <AdminDashboard />;
    }
    return <StudentDashboard />;
  }

  if (selectedRole) {
    return (
      <LoginForm
        role={selectedRole}
        onBack={() => setSelectedRole(null)}
        onSuccess={() => {}}
      />
    );
  }

  return <RoleSelector onSelectRole={setSelectedRole} />;
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
