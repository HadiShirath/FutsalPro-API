const User = require("../user/model");
const path = require("path");
const config = require("../../config");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  signup: async (req, res, next) => {
    try {
      const payload = req.body;

      if (req.file) {
        // tmp_path
        const tmp_path = req.file.path;

        // target_path
        const originalExt = req.file.originalname.split(".")[1];
        const fileName = req.file.filename + "." + originalExt;
        const target_path = path.resolve(
          config.rootPath,
          `public/uploads/${fileName}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);
        src.on("end", async () => {
          try {
            const user = await User.create({ ...payload, avatar: fileName });

            delete user._doc.password;

            res.status(201).json({ data: user });
          } catch (err) {
            fs.unlinkSync(target_path);

            if (err && err.name === "ValidationError") {
              return res.status(422).json({
                error: 1,
                message: err.message,
                fields: err.errors,
              });
            }
            next(err);
          }
        });
      } else {
        const user = await User.create(payload);

        res.status(201).json({ data: user });
      }
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.status(422).json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next();
    }
  },
  signin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      await User.findOne({ email: email })
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
                  profession: player.profession,
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
};
