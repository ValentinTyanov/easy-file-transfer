const express = require("express");
const passport = require("passport");
require("dotenv").config();
const passportConfig = require("./passportConfig");
const routes = require("./routes");
const app = express();

// Initialize body parser to allow parsing both JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport Strategies before Routes
passportConfig(passport);

app.use(passport.initialize());

app.use("/", routes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
