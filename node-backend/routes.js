const express = require("express");
const router = express.Router();
const passport = require("passport");
const apiService = require("./services/apiService");

require("./passportConfig")(passport);
router.use(passport.initialize());

router.post("/signup", apiService.signup);

router.post("/signin", apiService.signin);

router.get("/list", apiService.list);

router.post("/upload", apiService.upload);

router.get("/download/:filename", apiService.download);

router.get("/downloadMultiple", apiService.downloadMultiple);

module.exports = router;
