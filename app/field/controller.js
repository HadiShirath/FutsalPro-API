const Field = require("./model");
const User = require("../user/model");
const config = require("../../config");
const path = require("path");
const fs = require("fs");

module.exports = {
  field: async (req, res) => {
    try {
      const { name = "" } = req.query;

      let criteria = {};

      if (name.length) {
        criteria = {
          ...criteria,
          name: { $regex: `${name}`, $options: "i" },
        };
      }

      const field = await Field.find(criteria);
      res.status(200).json({ data: field });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  addField: async (req, res) => {
    try {
      const payload = req.body;
      if (req.file) {
        // const field = await Field.create(payload);
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
            const field = await Field.create({
              ...payload,
              photo: fileName,
            });

            res.status(201).json({ data: field });
          } catch (err) {}
        });
      } else {
        res.status(403).json({ message: "Photo Lapangan belum ditambahkan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  editField: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, photo, desc, facilities, rating } =
        req.body;

      const checkField = await Field.findById(id);

      if (checkField) {
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
              const fieldOld = await Field.findById(id);
              const currentImage = `${config.rootPath}/public/uploads/${fieldOld.photo}`;

              if (fs.existsSync(currentImage)) {
                fs.unlinkSync(currentImage);
              }

              await Field.updateOne(
                { _id: id },
                {
                  name,
                  category,
                  price,
                  desc,
                  facilities,
                  rating,
                  photo: fileName,
                }
              );

              const field = await Field.findById(id);
              res.status(200).json({ data: field });
            } catch (err) {
              fs.unlinkSync(target_path);

              res
                .status(403)
                .json({ error: 1, message: err.message, fields: err.errors });
            }
          });
        } else {
          const field = await Field.findOneAndUpdate(
            { _id: id },
            { name, category, price, desc, facilities, rating },
            { new: true }
          );

          res.status(200).json({ data: field });
        }
      } else {
        res.status(403).json({ message: "Field ID tidak ditemukan" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  deleteField: async (req, res) => {
    try {
      const { id } = req.params;

      const fieldOld = await Field.findById(id);

      const field = await Field.deleteOne({ _id: id });

      if (field.deletedCount === 1) {
        fs.unlinkSync(`${config.rootPath}/public/uploads/${fieldOld.photo}`);
      }

      res.status(200).json({
        message:
          field.deletedCount === 1
            ? "Berhasil Hapus Lapangan"
            : "Gagal Menghapus Lapangan",
      });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  ratingField: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const checkField = await Field.findById(id);
      const user = await User.findById(req.user._id);

      if (user) {
        if (checkField) {
          const ratingLapangan = checkField.rating;
          const ratingUser = rating;

          const dataRating = ratingLapangan.map((key, index) => {
            return ratingUser[index] === 1 ? ratingLapangan[index] + 1 : key;
          });

          const field = await Field.findOneAndUpdate(
            { _id: id },
            { rating: dataRating },
            { new: true }
          );

          res.status(200).json({ data: field });
        } else {
          res.status(403).json({ message: "Field ID tidak ditemukan.!" });
        }
      } else {
        res
          .status(403)
          .json({ message: "Only USER has Access this resource.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  favoriteField: async (req, res) => {
    try {
      const { id } = req.params;
      const field = await Field.findById(id);

      if (field) {
        const result = await User.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { favorite: field._id } },
          { new: true }
        );

        res.status(200).json({ data: result });
      } else {
        res.status(403).json({ message: "Field ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  unFavoriteField: async (req, res) => {
    try {
      const { id } = req.params;
      const field = await Field.findById(id);

      if (field) {
        const result = await User.findOneAndUpdate(
          { _id: req.user._id },
          { $pull: { favorite: field._id } },
          { new: true }
        );

        res.status(200).json({ data: result });
      } else {
        res.status(403).json({ message: "Field ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};
