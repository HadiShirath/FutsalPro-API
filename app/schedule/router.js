const express = require("express");
const router = express.Router();
const { approvedSchedule, schedule, cancelSchedule } = require("./controller");
const { isLoginAdmin, isLogin } = require("../middleware/auth");

router.get("/:id", isLogin, schedule);
router.post("/:id/create", isLoginAdmin, approvedSchedule);
router.delete("/:id/cancel", isLogin, cancelSchedule);

module.exports = router;
