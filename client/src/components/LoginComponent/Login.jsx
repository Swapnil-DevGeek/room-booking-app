import React from 'react'
import { Button } from '../ui/button'
import './Login.css'

const Login = () => {
    const googleAuth = ()=>{
        window.open(
            `https://room-booking-app-backend.onrender.com/auth/google/callback`,
            "_self"
        );
    }

    return (
    <div className="login-page">
        <div className="glass-card">
            <h1 className="title">Welcome to Room Booking Portal</h1>
            <Button
            onClick={googleAuth}
            className="google-button"
            variant="outline">
                Log In with Google
            </Button>
        </div>
    </div>
    )
}

export default Login
