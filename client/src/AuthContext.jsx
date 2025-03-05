import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
        } else {
          handleLogout('Your session has expired. Please log in again.');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        handleLogout('Authentication error occurred.');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = (message = 'You have been logged out.') => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    toast.success(message);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, handleLogout, isLoading, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
