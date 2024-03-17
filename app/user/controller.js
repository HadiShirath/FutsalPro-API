const User = require("./model");
const path = require("path");
const config = require("../../config");
const fs = require("fs");

module.exports = {
  profile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate("favorite");
      res.status(200).json({ data: user });
    } catch (err) {
      res.status(422).json({ message: err.message || "Internal Server Error" });
    }
  },
  editProfile: async (req, res) => {
    try {
      const { fullName, username, phoneNumber, address, profession } = req.body;

      if (req.file) {
        const tmp_path = req.file.path;

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
            const user = await User.findById(req.user._id);

            // hapus foto
            const currentImage = `${config.rootPath}/public/uploads/${user.avatar}`;

            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage);
            }

            await User.updateOne(
              { _id: req.user._id },
              {
                fullName,
                username,
                phoneNumber,
                address,
                profession,
                avatar: fileName,
              }
            );

            const result = await User.findById(req.user._id);

            res.status(200).json({ data: result });
          } catch (err) {
            fs.unlinkSync(target_path);

            if (err && err.message === "ValidationError") {
              return res
                .status(422)
                .json({ error: 1, message: err.message, fields: err.errors });
            }
          }
        });
      } else {
        const user = await User.updateOne(
          { _id: req.user._id },
          {
            fullName,
            username,
            phoneNumber,
            address,
            profession,
          }
        );

        const result = await User.findById(req.user._id);

        res.status(200).json({ data: result });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};
