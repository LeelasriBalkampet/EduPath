import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();

      if (token) {
        try {
          const response = await api.auth.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          api.removeToken();
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = useCallback(async (email, password, name, role = 'student') => {
    try {
      const response = await api.auth.register({ email, password, name, role });

      // Save token and user
      api.setToken(response.token);
      setUser(response.user);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const response = await api.auth.login({ email, password, role });

      // Save token and user
      api.setToken(response.token);
      setUser(response.user);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and token
      api.removeToken();
      setUser(null);
    }
  }, []);

  const updateLanguage = useCallback(
    async (language) => {
      if (user && user.role === "student") {
        try {
          await api.students.updateLanguage(user.id, language);

          // Update local user state
          setUser(prevUser => ({
            ...prevUser,
            preferredLanguage: language,
          }));
        } catch (error) {
          console.error('Update language error:', error);
        }
      }
    },
    [user]
  );

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.auth.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const currentStudent =
    user && user.role === "student" ? user : null;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateLanguage,
        refreshUser,
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
