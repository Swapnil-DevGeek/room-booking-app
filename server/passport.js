const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { User } = require("./models/User");
const express = require("express");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://room-booking-app-backend.onrender.com/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      const email = profile.emails[0].value;

      try {
        let user = await User.findOne({ email });

        if (!user) {
          // If user doesn't exist, create a new student user
          user = new User({ email, role: "student" });
          await user.save();
        }

        // Set redirect URL based on user role
        profile.redirectUrl = user.role === "admin" ? "https://room-booking-app-frontend.onrender.com/admin" : "https://room-booking-app-frontend.onrender.com/student";
        profile.role = user.role;

        callback(null, profile);
      } catch (error) {
        callback(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
