import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticated fetch wrapper
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Token expired or invalid, auto-logout
      logout();
      throw new Error("Session expired, please login again");
    }

    return res;
  };

  // Check login status on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authFetch("/api/users/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auto login error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Sync dark mode class globally when user state changes
  useEffect(() => {
    if (user && user.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [user]);

  const handleResponse = async (res, defaultErrorMsg = "Request failed") => {
    if (!res.ok) {
      let message = defaultErrorMsg;
      try {
        const data = await res.json();
        message = data.message || message;
      } catch (e) {
        message = `Server error (${res.status}). Please check if the backend server is running.`;
      }
      throw new Error(message);
    }
    try {
      return await res.json();
    } catch (e) {
      throw new Error("Invalid response format from server");
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse(res, "Login failed");

      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        currency: data.currency,
        darkMode: data.darkMode,
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await handleResponse(res, "Registration failed");

      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        currency: data.currency,
        darkMode: data.darkMode,
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const data = await handleResponse(res, "Failed to update profile");

      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        currency: data.currency,
        darkMode: data.darkMode,
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        authFetch,
        handleResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
