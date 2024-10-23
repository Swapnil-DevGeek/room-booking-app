// Frontend: App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add error state to handle authentication errors
  const [authError, setAuthError] = useState(null);

  // Configure axios defaults
  axios.defaults.withCredentials = true;  // Important for handling cookies
  
  // Set up Axios interceptor with error handling
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Add CORS credentials
    config.withCredentials = true;
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Add response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
      }
      return Promise.reject(error);
    }
  );

  const getUser = async () => {
    try {
      const url = `https://room-booking-app-backend.onrender.com/auth/login/success`;
      const { data } = await axios.get(url);
      
      if (data.user) {
        setUser(data.user);
        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        navigate(data.user.role === 'admin' ? '/admin' : '/student');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError(error.response?.data?.message || "Authentication failed");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {authError}
        </div>
      )}
      <Routes>
        <Route path='/' element={<Login />} />
        <Route
          path='/admin'
          element={
            <ProtectedRoute user={user} role="admin">
              <Admin userDetails={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/student'
          element={
            <ProtectedRoute user={user} role="student">
              <Student userDetails={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;