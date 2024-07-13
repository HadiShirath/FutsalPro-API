const express = require("express");
const router = express.Router();
const { approvedSchedule, schedule, addReminder, deleteReminder, cancelSchedule } = require("./controller");
const { isLoginAdmin, isLogin } = require("../middleware/auth");

router.get("/:id", isLogin, schedule);
router.post("/:id/create", isLoginAdmin, approvedSchedule);
router.delete("/:id/cancel", isLogin, cancelSchedule);
router.post("/:id/reminder", isLogin, addReminder);
router.delete("/:id/reminder/delete", isLogin, deleteReminder);

module.exports = router;
