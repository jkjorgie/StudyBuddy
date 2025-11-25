//routes/index.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const isAuthenticated = require("../middleware/authenticate");

router.use("/api-docs", require("./swagger"));

// #swagger.tags = ['General']
router.get("/", (req, res) => {
  res.json({
    message: "Study Buddy API",
    status: "Running",
    timestamp: new Date().toISOString(),
    docs: "/api-docs",
  });
});

router.use("/user", require("./user"));
router.use("/course", require("./course"));
router.use("/study-session", require("./study-session"));
router.use("/task", require("./task"));

router.get("/login", passport.authenticate("github"), (req, res) => {});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Destroy the session completely
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      // Clear the session cookie
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

module.exports = router;
