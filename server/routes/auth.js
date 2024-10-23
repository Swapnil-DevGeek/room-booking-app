const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');

router.get("/login/success", (req, res) => {
  // Debug logging
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('IsAuthenticated:', req.isAuthenticated());

  if (req.isAuthenticated() && req.user) {
    const token = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.emails[0].value,
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      error: false,
      message: "Successfully logged in",
      user: {
        id: req.user.id,
        email: req.user.emails[0].value,
        role: req.user.role,
        token
      }
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
