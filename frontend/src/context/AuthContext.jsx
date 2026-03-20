import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const initialUser = {
  name: "Operator",
  role: "operator"
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const login = (role = "operator") => {
    const newUser = {
      name: role === "admin" ? "Administrator" : "Operator",
      role
    };
    setUser(newUser);
    navigate("/");
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const switchRole = () => {
    setUser((prev) => {
      if (!prev) return initialUser;
      const nextRole = prev.role === "admin" ? "operator" : "admin";
      return {
        name: nextRole === "admin" ? "Administrator" : "Operator",
        role: nextRole
      };
    });
  };

  const value = useMemo(
    () => ({ user, login, logout, switchRole }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
