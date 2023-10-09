const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = function (passport) {
  //TODO: remove once you have DB storage
  const hardcodedUser = {
    id: "1",
    email: "user@email.com",
    password: bcrypt.hashSync("password", 10),
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        console.log("Incoming email:", email);
        console.log("Incoming password:", password);

        const bCryptComparison = bcrypt.compareSync(
          password,
          hardcodedUser.password
        );

        console.log("Password Match: ", bCryptComparison);

        if (email === hardcodedUser.email && bCryptComparison) {
          console.log("User authenticated");
          return done(null, hardcodedUser);
        } else {
          console.log("Authentication failed");
          return done(null, false, { message: "Incorrect email or password." });
        }
      }
    )
  );

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  //TODO: rework to work with DB once you have DB
  // Unlike Local Strategy (which will only be used on logic to generate the JWT Token), this strategy will be used as token authenticaton for all other requests
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      if (jwt_payload.id === hardcodedUser.id) {
        return done(null, hardcodedUser);
      }
      return done(null, false);
    })
  );
};
