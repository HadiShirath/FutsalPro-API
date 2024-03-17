const express = require("express");
const router = express.Router();
const { payment, statusPayment } = require("./controller");
const { isLogin } = require("../middleware/auth");

router.use(isLogin);
router.post("/:id/transactions", payment);
router.get("/:id/status", statusPayment);

module.exports = router;
