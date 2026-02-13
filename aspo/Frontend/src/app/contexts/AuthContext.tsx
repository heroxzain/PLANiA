import React, { createContext, useContext, useState, useEffect } from "react";
import API_BASE_URL from '../../config';

interface User {
  fullName: string;
  displayName: string;
  email: string;
}

interface Subject {
  _id: string;
  name: string;
  examDate: string;
  difficulty: "easy" | "medium" | "hard";
  materials: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    fullName: string,
    displayName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, "_id">) => Promise<void>;
  updateSubject: (_id: string, updates: Partial<Subject>) => Promise<void>;
  removeSubject: (_id: string) => Promise<void>;
  fetchSubjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // ================= LOAD USER ON REFRESH =================
  useEffect(() => {
    const storedUser = localStorage.getItem("plania_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    } else {
      setSubjects([]); // Clear subjects if logged out
    }
  }, [user]); // specific dependency on user

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/${API_BASE_URL}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const login = async (
    // ================= LOGIN =================
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login Error:", await response.text());
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("plania_user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ================= SIGNUP =================
  const signup = async (
    fullName: string,
    displayName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          displayName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        console.error("Signup Error:", await response.text());
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("plania_user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);
    setSubjects([]);
    localStorage.removeItem("plania_user");
    localStorage.removeItem("token");
  };

  // ================= ADD SUBJECT =================
  const addSubject = async (subjectData: Omit<Subject, "_id">) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`/${API_BASE_URL}/api/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      console.error("Add Subject Error:", await response.text());
      return;
    }

    const data = await response.json();
    setSubjects((prev) => [...prev, data]);
  };

  // ================= UPDATE SUBJECT =================
  const updateSubject = async (
    _id: string,
    updates: Partial<Subject>
  ) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`/${API_BASE_URL}/api/subjects/${_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      console.error("Update Subject Error:", await response.text());
      return;
    }

    const data = await response.json();
    setSubjects((prev) =>
      prev.map((sub) => (sub._id === _id ? data : sub))
    );
  };

  // ================= REMOVE SUBJECT =================
  const removeSubject = async (_id: string) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`/${API_BASE_URL}/api/subjects/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Delete Error:", await response.text());
      return;
    }

    setSubjects((prev) =>
      prev.filter((sub) => sub._id !== _id)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        subjects,
        addSubject,
        updateSubject,
        removeSubject,
        fetchSubjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
