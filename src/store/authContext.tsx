import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserData {
  userId?: number | string;
  username?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  subRoles?: string[];
  studentId?: string;
  sprNo?: string;
  department?: string;
  section?: string;
  year?: string;
  score?: number;
  totalXp?: number;
  isCaptain?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  user: UserData | null;
  role: string | null;
  subRoles: string[];
  login: (tokenValue: string, userData: UserData | string) => void;
  setSubRoles: (roles: string[]) => void;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isCaptain: boolean;
  isStudent: boolean;
  isParent: boolean;
  isHOD: boolean;
  isCC: boolean;
  isDC: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('spdms_token') || localStorage.getItem('token')
  );
  
  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('spdms_user') || localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (_) {
      return null;
    }
  });

  const [role, setRole] = useState<string | null>(
    () => localStorage.getItem('userRole') || (user?.roles && user.roles[0]) || null
  );
  
  const [subRoles, setSubRolesState] = useState<string[]>(user?.subRoles || []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('spdms_token', token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('spdms_token');
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('spdms_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('spdms_user');
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (role) localStorage.setItem('userRole', role);
    else localStorage.removeItem('userRole');
  }, [role]);

  const login = (newToken: string, userData: UserData | string) => {
    setToken(newToken);
    if (typeof userData === 'string') {
      setRole(userData);
      setUser({ username: userData, roles: [userData] });
    } else {
      setUser(userData);
      const primaryRole = userData.roles && userData.roles[0] ? userData.roles[0] : null;
      if (primaryRole) setRole(primaryRole);
      if (userData.subRoles) setSubRolesState(userData.subRoles);
    }
  };

  const setSubRoles = (roles: string[]) => {
    setSubRolesState(roles);
    if (user) {
      setUser({ ...user, subRoles: roles });
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setSubRolesState([]);
    localStorage.removeItem('spdms_token');
    localStorage.removeItem('spdms_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const isAdmin = !!(user?.roles?.includes('ROLE_ADMIN') || role === 'ADMIN' || role === 'ROLE_ADMIN');
  const isTeacher = !!(user?.roles?.includes('ROLE_TEACHER') || role === 'TEACHER' || role === 'ROLE_TEACHER');
  const isCaptain = !!(user?.roles?.includes('ROLE_CAPTAIN') || user?.isCaptain || role === 'CAPTAIN' || subRoles.includes('CAPTAIN'));
  const isStudent = !!(user?.studentId || role === 'STUDENT' || role === 'ROLE_STUDENT');
  const isParent = !!(user?.sprNo || role === 'PARENT' || role === 'ROLE_PARENT');
  const isHOD = !!(subRoles.includes('HOD') || user?.subRoles?.includes('HOD'));
  const isCC = !!(subRoles.includes('CC') || user?.subRoles?.includes('CC'));
  const isDC = !!(subRoles.includes('Discipline Commitee') || user?.subRoles?.includes('Discipline Commitee'));

  return (
    <AuthContext.Provider value={{ 
      token, user, role, subRoles, login, setSubRoles, logout,
      isAdmin, isTeacher, isCaptain, isStudent, isParent, isHOD, isCC, isDC
    }}>
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
