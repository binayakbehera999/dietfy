var express = require("express");
var router = express.Router();
var passport = require("passport");

/* GET users listing. */
router.get(
  "/",
  passport.authenticate("fitbit", {
    scope: ["activity", "heartrate", "location", "profile"]
  })
);

router.get(
  "/callback",
  passport.authenticate("fitbit", {
    successRedirect: "/user/success",
    failureRedirect: "/user/error"
  })
);

router.get("/success", (req, res) => {
  res.redirect("/userDashboard");
});

router.get("/failure", (req, res) => {
  res.status(403);
});

router.get("/logout", (req, res) => {
  console.log(req);
  res.redirect("/");
});

router.get("/check", (req, res) => {
  console.log(req.session.passport);
});

module.exports = router;
