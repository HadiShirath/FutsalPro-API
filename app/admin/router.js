const express = require("express");
const router = express.Router();
const { signup, signin, users } = require("./controller");
const { isLoginAdmin } = require("../middleware/auth");
const multer = require("multer");
const os = require("os");

router.post("/signin", signin);
router.get("/users", isLoginAdmin, users);

module.exports = router;
