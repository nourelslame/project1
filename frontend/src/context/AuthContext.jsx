// src/context/AuthContext.jsx
// Stores the logged-in user's data and makes it available everywhere.
// Use the useAuth() hook in any page to get: user, login(), logout()
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load saved user from localStorage when the app starts
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stagio_user')); }
    catch { return null; }
  });

  // Called after a successful login or register
  const login = (userData, token) => {
    localStorage.setItem('stagio_token', token);
    localStorage.setItem('stagio_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Called when the user clicks "Logout"
  const logout = () => {
    localStorage.removeItem('stagio_token');
    localStorage.removeItem('stagio_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}