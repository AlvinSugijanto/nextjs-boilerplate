"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

// 🎯 Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };

    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "LOGIN_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// 🎯 Context setup
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: true,
    isLoading: true,
    error: null,
  });

  // Restore user state on mount or initial load
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
    if (isLoggedIn) {
      dispatch({ type: "INIT", payload: {} }); // dummy user object
    } else {
      dispatch({ type: "INIT", payload: null });
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      dispatch({ type: "LOGIN_START" });
      localStorage.setItem("is_logged_in", "true");

      dispatch({ type: "LOGIN_SUCCESS" });
      // dispatch({ type: "LOGIN_SUCCESS", payload: record });
      // return record;

      return true;
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error });
      throw error;
    }
  };

  // Login action SSO
  const loginSSO = async (provider = "google") => {
    try {
      dispatch({ type: "LOGIN_START" });

      localStorage.setItem("is_logged_in", "true");

      dispatch({ type: "LOGIN_SUCCESS" });
      // dispatch({ type: "LOGIN_SUCCESS", payload: record });
      // return record;

      return true;
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error });
      throw error;
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem("is_logged_in");
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated, // ✅ isAuthenticated state
    login,
    loginSSO,
    logout,
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
