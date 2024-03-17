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

const cartSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
