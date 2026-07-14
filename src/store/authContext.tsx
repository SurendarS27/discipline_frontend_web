import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  subRoles: string[];
  login: (token: string, role: string) => void;
  setSubRoles: (roles: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [subRoles, setSubRolesState] = useState<string[]>([]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem('userRole', role);
    else localStorage.removeItem('userRole');
  }, [role]);

  const login = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  const setSubRoles = (roles: string[]) => {
    setSubRolesState(roles);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setSubRolesState([]);
  };

  return (
    <AuthContext.Provider value={{ token, role, subRoles, login, setSubRoles, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
