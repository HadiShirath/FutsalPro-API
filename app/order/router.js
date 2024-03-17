const express = require("express");
const router = express.Router();
const {
  historyOrder,
  historyOrderAll,
  createOrder,
  statusOrder,
  deleteOrder,
  addReminder,
  deleteReminder,
} = require("./controller");
const { isLogin, isLoginAdmin } = require("../middleware/auth");

router.get("/history", isLogin, historyOrder);
router.get("/history/all", isLoginAdmin, historyOrderAll);
router.post("/create", isLogin, createOrder);
router.put("/:id/status", isLoginAdmin, statusOrder);
router.delete("/:id/delete", isLoginAdmin, deleteOrder);
router.post("/:id/reminder", isLogin, addReminder);
router.delete("/:id/reminder/delete", isLogin, deleteReminder);

module.exports = router;
