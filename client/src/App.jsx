import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
import Student from './Pages/Student/Student';
import Admin from './Pages/Admin/Admin';
import Login from './components/LoginComponent/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Base URL configuration
  const BASE_URL = 'https://room-booking-app-backend.onrender.com';

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          setAuthError('Session expired. Please login again.');
          navigate('/');
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  const getUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/login/success`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.user) {
        setUser(response.data.user);
        if (response.data.user.token) {
          localStorage.setItem('token', response.data.user.token);
        }
        
        // Clear any previous auth errors
        setAuthError(null);
        
        // Navigate based on role
        const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/student';
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 403) {
        setAuthError('Not authorized. Please login again.');
      } else if (error.response?.status === 401) {
        setAuthError('Session expired. Please login again.');
      } else {
        setAuthError('Unable to connect to the server. Please try again later.');
      }
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    getUser();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {authError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-100 border-b border-red-400 text-red-700 px-4 py-3">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <p>{authError}</p>
            <button
              onClick={() => setAuthError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} role="admin">
              <Admin userDetails={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} role="student">
              <Student userDetails={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;