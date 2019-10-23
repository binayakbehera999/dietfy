const passport = require("passport");
var FitBitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
const User = require("../models/user");
var axios = require("axios");
var fs = require("fs");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});
passport.use(
  new FitBitStrategy(
    {
      clientID: "22B645",
      clientSecret: "0fe01d68528bad127ca44c81eb28480c",
      callbackURL: "http://localhost:3000/auth/fitbit/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      var calorieIntakeConfig = {
        url:
          "https://api.fitbit.com/1/user/6PSSYP/activities/date/2019-9-1.json",
        headers: { authorization: `Bearer ${accessToken}` }
      };
      var userConfig = {
        url: "https://api.fitbit.com/1/user/6PSSYP/profile.json",
        headers: { authorization: `Bearer ${accessToken}` }
      };

      axios
        .all([axios(calorieIntakeConfig), axios(userConfig)])
        .then(
          axios.spread((calorieIntakeRes, userRes) => {
            var userPorfile = JSON.stringify(userRes.data);
            fs.writeFile("userProfile.json", userPorfile);
            var calorieIntake = JSON.stringify(calorieIntakeRes.data);
            fs.writeFile("calorieIntake.json", calorieIntake);
          })
        )
        .catch(err => console.log(err.data));

      User.findOne({ fitbitId: profile.id }).then(currentUser => {
        if (currentUser) {
          // already have this user
          done(null, currentUser);
        } else {
          // if not, create user in our db
          new User({
            fitbitId: profile.id,
            username: profile.username,
            name: profile.displayName,
            auth: "accessToken"
          })
            .save()
            .then(newUser => {
              done(null, newUser);
            });
        }
      });
    }
  )
);
