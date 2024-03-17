const express = require("express");
const router = express.Router();
const {
  field,
  addField,
  editField,
  deleteField,
  ratingField,
  favoriteField,
  unFavoriteField,
} = require("./controller");
const { isLogin, isLoginAdmin } = require("../middleware/auth");
const multer = require("multer");
const os = require("os");

router.get("/", isLogin, field);
router.post(
  "/create",
  multer({ dest: os.tmpdir() }).single("image"),
  isLoginAdmin,
  addField
);
router.put(
  "/:id/edit",
  multer({ dest: os.tmpdir() }).single("image"),
  isLoginAdmin,
  editField
);
router.delete("/:id/delete", deleteField);
router.post("/:id/rating", isLogin, ratingField);
router.post("/:id/favorite", isLogin, favoriteField);
router.delete("/:id/unfavorite", isLogin, unFavoriteField);

module.exports = router;
