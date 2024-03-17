const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const { isLogin } = require("../middleware/auth");
const { profile, editProfile } = require("./controller");

router.use(isLogin);
router.get("/profile", profile);
router.put(
  "/profile/edit",
  multer({ dest: os.tmpdir() }).single("image"),
  editProfile
);

module.exports = router;
