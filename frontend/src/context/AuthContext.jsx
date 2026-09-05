import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('accessToken');

      if (token && storedUser) {
        setUser(storedUser);
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('[AuthContext] Verification failed:', err.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (username, email, password) => {
    const res = await authService.register(username, email, password);
    if (res.success) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.permissions ? user.permissions.includes(permissionName) : false;
  };

  const hasRole = (roleName) => {
    if (!user) return false;
    return user.role === roleName;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
