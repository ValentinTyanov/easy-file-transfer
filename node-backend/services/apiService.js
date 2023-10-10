const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const upload = require("../multerConfig");
const archiver = require("archiver");

module.exports = {
  signup: (req, res) => {
    // TODO: logic for storing user credentials goes here. E.g., save to database.
  },

  signin: (req, res) => {
    // "LOCAL" means use local strategy from passportConfig
    console.log(req.body);
    passport.authenticate("local", { session: false }, (err, user) => {
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
  },

  list: (req, res) => {
    passport.authenticate("jwt", { session: false })(req, res, () => {
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
    });
  },

  upload: (req, res) => {
    passport.authenticate("jwt", { session: false })(req, res, () => {
      upload(req, res, (err) => {
        if (err) {
          return res.status(500).json({ message: "Upload failed" });
        } else {
          const filenames = req.files.map((file) => file.filename);
          return res.json({ message: "Files Uploaded", filenames: filenames });
        }
      });
    });
  },

  download: (req, res) => {
    passport.authenticate("jwt", { session: false })(req, res, () => {
      const filename = req.params.filename;
      console.log("Attempting to download file: ", filename);

      const file = `./uploads/${filename}`;
      res.download(file);
    });
  },

  downloadMultiple: (req, res) => {
    passport.authenticate("jwt", { session: false })(req, res, () => {
      const filenames = req.body.filenames || [];

      const archive = archiver("zip", {
        zlib: { level: 9 }, // Compression level
      });

      // Set the name of the response object
      res.attachment("files.zip");

      // Set the response object to a "zip" file with lvl 9 compression
      archive.pipe(res);

      // Append each file to the archive
      filenames.forEach((filename) => {
        const file = `./uploads/${filename}`;
        archive.file(file, { name: filename });
      });

      archive.finalize();
    });
  },
};
