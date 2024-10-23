const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');
const session = require('express-session'); // Add this import

// Add session middleware configuration
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

router.get("/login/success", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    // Create JWT token
    const token = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.email,
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      error: false,
      message: "Successfully logged in",
      user: {
        ...req.user,
        token
      },
      redirectUrl: req.user.redirectUrl
    });
  } else {
    res.status(403).json({ 
      error: true, 
      message: "Not Authorized" 
    });
  }
});

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    // Ensure user is authenticated before redirect
    if (req.user) {
      res.redirect(`https://room-booking-app-frontend.onrender.com/auth/success?token=${req.user.token}`);
    } else {
      res.redirect('/login/failed');
    }
  }
);

module.exports = router;
