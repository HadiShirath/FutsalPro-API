const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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
    profession: {
      type: String,
      required: [true, "Profesi harus diisi"],
    },
    avatar: {
      type: String,
    },
    favorite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field",
      },
    ],
  },
  { timestamps: true }
);

userSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("User").countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`
);

userSchema.pre("save", function (next) {
  const HASH_ROUND = 10;
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
