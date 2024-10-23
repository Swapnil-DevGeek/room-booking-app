import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Admin from './Pages/Admin/Admin'
import Student from './Pages/Student/Student'
import Login from './components/LoginComponent/Login'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // New loading state
  const navigate = useNavigate();

  // Axios global configuration for including credentials with each request
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

  const getUser = async () => {
    try {
      const url = `https://room-booking-app-backend.onrender.com/auth/login/success`;
      const { data } = await axios.get(url);

      setUser(data.user);
      setLoading(false);  // Stop loading when user is set

      // Redirect based on user role
      if (data.user) {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);  // Stop loading even if there is an error
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
