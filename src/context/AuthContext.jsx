import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { mockStudents, mockAdmins } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password, role) => {
    // Admin login
    if (role === "admin") {
      const admin = mockAdmins.find((a) => a.email === email);
      if (admin && password === "admin123") {
        setUser(admin);
        return true;
      }
    }

    // Student login
    if (role === "student") {
      const student = mockStudents.find((s) => s.email === email);

      if (student && password === "student123") {
        setUser(student);
        return true;
      }

      // Auto-register new student
      if (password === "student123") {
        const newStudent = {
          id: `student-${Date.now()}`,
          email,
          name: email.split("@")[0],
          role: "student",
          createdAt: new Date().toISOString(),
          preferredLanguage: "en",
          quizHistory: [],
          topicScores: [],
        };

        mockStudents.push(newStudent);
        setUser(newStudent);
        return true;
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateLanguage = useCallback(
    (language) => {
      if (user && user.role === "student") {
        const updatedStudent = {
          ...user,
          preferredLanguage: language,
        };

        setUser(updatedStudent);

        const index = mockStudents.findIndex(
          (s) => s.id === user.id
        );
        if (index !== -1) {
          mockStudents[index] = updatedStudent;
        }
      }
    },
    [user]
  );

  const currentStudent =
    user && user.role === "student" ? user : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateLanguage,
        currentStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }
  return context;
}
