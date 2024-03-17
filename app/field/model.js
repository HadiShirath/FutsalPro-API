const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nama Lapangan harus diisi"],
  },
  category: {
    type: String,
    enum: ["pagi-sore", "malam"],
    default: "pagi-sore",
  },
  price: {
    type: Number,
    required: [true, "Harga sewa lapangan harus diisi"],
  },
  photo: {
    type: String,
  },
  desc: {
    type: String,
    required: [true, "Deskripsi harus diisi"],
  },
  facilities: {
    type: String,
    default: "-",
  },
  rating: {
    type: Array,
    default: [0, 0, 0, 0, 0],
  },
});

// fieldSchema.pre("save", function (next) {
//   const inputString = this.rating[0];

//   // Menghilangkan tanda kurung siku dan spasi dari string input
//   const cleanedString = inputString.replace(/[\[\]"\s]/g, "");

//   // Membagi string menjadi array menggunakan koma sebagai pemisah
//   const resultArray = cleanedString.split(",").map(Number);

//   this.rating = resultArray;
//   next();
// });

const Field = mongoose.model("Field", fieldSchema);

module.exports = Field;
