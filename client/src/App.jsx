import React, { useEffect, useState } from 'react'
import { Routes,Route,Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Admin from './Pages/Admin/Admin'
import Student from './Pages/Student/Student'
import Login from './components/LoginComponent/Login'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const [user,setUser] = useState(null);
  const navigate = useNavigate();

  const getUser = async ()=>{
    try {
      const url = `https://room-booking-app-backend.onrender.com/auth/login/success`;
      const {data} = await axios.get(url,{withCredentials:true});
      setUser(data.user);

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
    }
  }

  useEffect(()=>{
    getUser();
  },[])

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
  )
}

export default App
