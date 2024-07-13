const Admin = require("./model");
const User = require("../user/model");
const path = require("path");
const config = require("../../config");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  signin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      await Admin.findOne({ email: email })
        .then((player) => {
          if (player) {
            const checkPassword = bcrypt.compareSync(password, player.password);
            if (checkPassword) {
              const token = jwt.sign(
                {
                  id: player._id,
                  fullName: player.fullName,
                  email: player.email,
                  username: player.username,
                  phoneNumber: player.phoneNumber,
                  address: player.address,
                  avatar: player.avatar,
                },
                config.jwtKey
              );
              res.status(200).json({ data: token });
            } else {
              res
                .status(403)
                .json({ message: "Password yang anda masukkan salah.!" });
            }
          } else {
            res
              .status(403)
              .json({ message: "Email yang anda masukkan belum terdaftar.!" });
          }
        })
        .catch((err) => {
          if (err && err.name === "ValidationError") {
            return res.status(422).json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        });
    } catch (err) {
      res.status(500).json({ data: err.message || "Internal Server Error" });
    }
  },
  users: async (req, res) => {
    try {
      const user = await User.find();
      res.status(200).json({ status: "success", payload: user });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};
