const router = require("express").Router();
const passport = require("passport");

router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Successfully logged in",
            user: req.user,
            redirectUrl: req.user.redirectUrl 
        });
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
    }
});

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login/failed",
    }),
    (req, res) => {
        // Send user data back to the client
        res.redirect(`https://room-booking-app-frontend.onrender.com/auth/success`);
    }
);

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('https://room-booking-app-frontend.onrender.com');
    });
});

module.exports = router;
