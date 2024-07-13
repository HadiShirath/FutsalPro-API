const Cart = require("./model");
const User = require("../user/model");
const Admin = require("../admin/model");
const Field = require("../field/model");

module.exports = {
  cart: async (req, res) => {
    try {
      const cart = await Cart.find({ user: req.user._id });
      res.status(200).json({ data: cart });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  addCart: async (req, res) => {
    try {
      const payload = req.body;

      // add data user
      let user = await User.findById(req.user._id);

      if (!user) {
        user = await Admin.findById(req.user._id);
      }
      payload.user = user._id;

      let cart = await Cart.findOne({ user: req.user._id });

      // jika belum ada data cart --> SIMPAN, jika sudah ada data cart --> UPDATE,

      if (!cart) {
        // update TotalPrice
        const newCartdata = await handlePrice(payload);

        cart = new Cart(newCartdata);
        await cart.save();
        res.status(201).json({ data: cart });
      } else {
        const payloadDetail = payload.detail;

        await Promise.all(
          (cart.detail = cart.detail
            .map((item) => {
              const newData = payloadDetail.find(
                (checkItem) => checkItem.date === item.date
              );

              if (newData) {
                return {
                  ...item,
                  ...newData,
                };
              } else {
                return {
                  ...item,
                };
              }
            })
            .concat(
              payloadDetail.filter(
                (filter) =>
                  !cart.detail.some((item) => item.date === filter.date)
              )
            ))
        );

        // update TotalPrice
        const newCartdata = await handlePrice(cart);

        cart = new Cart(newCartdata);
        await cart.save();
        res.status(201).json({ data: cart });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  updateItemCart: async (req, res) => {
    try {
      const { id, date } = req.params;
      const payload = req.body;

      let cart = await Cart.findOne({ user: req.user._id });

      if (cart.detail) {
        // cek tanggal dan idItem apakah data di date/id tersedia
        const isData = cart.detail.some(
          (detail) =>
            detail.date === date &&
            detail.item.some((item) => item._id.toString() === id)
        );

        if (isData) {
          cart.detail = cart.detail.map((detailItem) => {
            if (detailItem.date === date) {
              detailItem.item = detailItem.item.map((item) => {
                if (item._id.toString() === id) {
                  return {
                    ...item,
                    schedule: payload.schedule,
                  };
                } else {
                  return { ...item };
                }
              });
            }

            return { ...detailItem };
          });

          // update TotalPrice
          const newCartdata = await handlePrice(cart);

          cart = new Cart(newCartdata);
          await cart.save();
          res.status(200).json({ data: cart });
        } else {
          res.status(404).json({
            message: "Data tidak ditemukan.!",
          });
        }
      } else {
        res.status(400).json({ message: "Dataaaa" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ messsage: err.message || "Internal Server Error" });
    }
  },
  deleteItemCart: async (req, res) => {
    try {
      const { id, date } = req.params;

      const cart = await Cart.findOne({ user: req.user._id });

      if (cart) {
        // cek tanggal dan id apakah data didalam date/id tersedia
        const isData = cart.detail.some(
          (detail) =>
            detail.date === date &&
            detail.item.some((item) => item._id.toString() === id)
        );

        if (isData) {
          const detailCart = cart.detail.map((detailItem) => {
            // hapus data sesuai dengan id item
            const newItems = detailItem.item.filter(
              (filter) => filter._id.toString() !== id
            );

            // dapatkan harga baru setelah item di hapus
            detailItem.price = newItems.reduce(
              (acc, item) => acc + item.price,
              0
            );

            return {
              ...detailItem,
              item: newItems,
            };
          });

          // filter semua item yang memiliki data
          cart.detail = detailCart.filter((detail) => detail.item.length > 0);

          // dapatkan nilai totalPrice dari seluruh item
          cart.totalPrice = cart.detail.reduce(
            (acc, curr) => acc + curr.price,
            0
          );

          if (cart.detail.length) {
            const updatedCart = await cart.save();
            res.status(200).json({ data: cart });
          } else {
            const deleteCart = await Cart.deleteOne({ _id: cart._id });
            res.status(200).json({ message: "Keranjang Berhasil Dihapus" });
          }
        } else {
          res.status(404).json({
            message: "Data tidak ditemukan.!",
          });
        }
      } else {
        res.status(404).json({
          message: "Data tidak ditemukan.!",
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};

const handlePrice = async (data) => {
  let totalPrice = 0;
  await Promise.all(
    data.detail.map(async (detail) => {
      await Promise.all(
        detail.item.map(async (item) => {
          const field = await Field.findById(item.field).select(
            "name category price photo"
          );
          item.field = field;
          item.price = field.price * item.schedule.length;
        })
      );

      detail.price = detail.item.reduce((acc, curr) => acc + curr.price, 0);
      totalPrice += detail.price;
    })
  );

  data.totalPrice = totalPrice;

  return data;
};
