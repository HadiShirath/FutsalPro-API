const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Nama Lengkap harus diisi"],
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      minLength: [8, "Password minimal 8 karakter"],
    },
    username: {
      type: String,
      required: [true, "Username harus diisi"],
      maxLength: [8, "Username maksimal 8 karakter"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor Telepon harus diisi"],
    },
    address: {
      type: String,
      required: [true, "Alamat harus diisi"],
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

adminSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("Admin").countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`
);

adminSchema.pre("save", function (next) {
  const HASH_ROUND = 10;
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
