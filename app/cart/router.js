const express = require("express");
const router = express.Router();
const { isLogin } = require("../middleware/auth");
const {
  cart,
  addCart,
  deleteItemCart,
  updateItemCart,
} = require("./controller");

router.use(isLogin);
router.get("/", cart);
router.post("/create", addCart);
router.delete("/:date/:id/delete", deleteItemCart);
router.put("/:date/:id/edit", updateItemCart);

module.exports = router;
