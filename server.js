// server.js
const express = require("express");
const mongodb = require("./data/database");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const routes = require("./routes");
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const cors = require("cors");

// Common middlewares (used in ALL environments)
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Z-Key"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});
app.use(cors({ methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"] }));
app.use(cors({ origin: "*" }));

// Auth / session / GitHub routes: ONLY when NOT in test
if (process.env.NODE_ENV !== "test") {
  // Sessions
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Root route showing login state (this will override the JSON "/" from routes)
  app.get("/", (req, res) => {
    res.send(
      req.session.user !== undefined
        ? `Logged in as ${req.session.user.displayName}`
        : "Logged out"
    );
  });

  // GitHub OAuth callback route
  app.get(
    "/github/callback",
    passport.authenticate("github", {
      failureRedirect: "/api-docs",
      session: false,
    }),
    (req, res) => {
      req.session.user = req.user;
      res.redirect("/");
    }
  );
}

// Mount all API routes (used in ALL environments)
app.use("/", routes);

// Start server ONLY outside tests
if (process.env.NODE_ENV !== "test") {
  mongodb.initDb((err) => {
    if (err) {
      console.log(err);
    } else {
      app.listen(port, () => {
        console.log(`Study Buddy API listening on port ${port}`);
        console.log(`Server running at http://localhost:${port}`);
      });

      // Ping database to verify connection
      mongodb.pingDatabase();
    }
  });
}

module.exports = app;
