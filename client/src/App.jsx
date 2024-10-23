import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Admin from './Pages/Admin/Admin';
import Student from './Pages/Student/Student';
import Login from './components/LoginComponent/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // New loading state
  const navigate = useNavigate();

  // Set up an Axios interceptor to set the Authorization header before each request
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  const getUser = async () => {
    try {
      const url = `https://room-booking-app-backend.onrender.com/auth/login/success`;
      const { data } = await axios.get(url);

      // Check if user data is returned
      if (data.user) {
        setUser(data.user);
        // Redirect based on user role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        // Handle case where user is not found
        console.log("User not found, redirecting to login.");
        navigate('/'); // Redirect to login if unauthorized
      }
    } catch (error) {
      console.log("Error fetching user:", error);
      setLoading(false);  // Stop loading even if there is an error
      if (error.response && error.response.status === 403) {
        console.log("Not authorized, redirecting to login.");
        navigate('/'); // Redirect to login if unauthorized
      }
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // Render a loading state while the user data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
}

export default App;
