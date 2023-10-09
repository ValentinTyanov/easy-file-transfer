const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const upload = require("./multerConfig");

require("./passportConfig")(passport);
router.use(passport.initialize());

router.post("/signup", (req, res, next) => {
  //TODO:  //logic for storing user credentials goes here. E.g., save to database.
});

router.post("/signin", (req, res, next) => {
  // "LOCAL" means use local strategy from passportConfig
  console.log(req.body);
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: err ? err.message : "User not found",
        user: user,
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      // Generate a signed JWT token and return in response
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.json({ user, token });
    });
  })(req, res);
});

router.get(
  "/list",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("Authenticated user:", req.user);
    console.log("Attempting to list files");

    fs.readdir("./uploads/", (err, files) => {
      if (err) {
        return res.status(500).json({ message: "Error reading directory" });
      } else {
        console.log("Successfully listed files");
        return res.json(files);
      }
    });
  }
);

router.post(
  "/upload",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("Attempting to upload");
    upload(req, res, (err) => {
      if (err) {
        res.status(500).json({ message: "Upload failed" });
      } else {
        const filenames = req.files.map((file) => file.filename);
        return res.json({ message: "Files Uploaded", filenames: filenames });
      }
    });
  }
);

router.get(
  "/download/:filename",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const filename = req.params.filename;
    console.log("Attempting to download file: ", filename);

    const file = `./uploads/${filename}`;
    res.download(file);
  }
);

module.exports = router;
