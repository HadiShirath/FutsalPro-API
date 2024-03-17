const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Field",
    required: [true, "Data Lapangan harus diisi"],
  },
  schedule: {
    type: Array,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
});

const detailSchema = new mongoose.Schema({
  date: {
    type: String,
    match: [
      /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/,
      'Format tanggal harus "YYYY-MM-DD"',
    ],
    required: true,
  },
  item: {
    type: [itemSchema],
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    detail: {
      type: [detailSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reminder: {
      type: String,
      default: "",
    },
    urlPayment: {
      type: String,
      default: "",
    },
    orderDate: {
      type: String,
      required: true,
    },
    orderTime: {
      type: String,
      required: true,
    },
    confirmation: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
