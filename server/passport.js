const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { User } = require("./models/User");
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://room-booking-app-backend.onrender.com/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        
        if (!user) {
          user = new User({ 
            email, 
            role: "student",
            googleId: profile.id,
            name: profile.displayName
          });
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user._id,
            email: user.email,
            role: user.role 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Add token and redirect URL to profile
        profile.token = token;
        profile.redirectUrl = user.role === "admin" 
          ? "https://room-booking-app-frontend.onrender.com/admin" 
          : "https://room-booking-app-frontend.onrender.com/student";
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
