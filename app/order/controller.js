const User = require("../user/model");
const Admin = require("../admin/model");
const Cart = require("../cart/model");
const Order = require("../order/model");
const Field = require("../field/model");
const Schedule = require("../schedule/model");

module.exports = {
  historyOrder: async (req, res) => {
    try {
      const order = await Order.find({ user: req.user._id });
      if (order) {
        res.status(200).json({ data: order });
      } else {
        res.status(404).json({ message: "Data tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  historyOrderAll: async (req, res) => {
    try {
      const { status = "", order_id = "" } = req.query;
      const user = req.user._id;

      let criteria = {};

      if (user.length) {
        criteria = {
          ...criteria,
          user: user,
        };
      }
      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      if (order_id.length) {
        criteria = {
          ...criteria,
          orderId: order_id,
        };
      }

      const order = await Order.find(criteria);
      res.status(200).json({ data: order });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  createOrder: async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });

      if (cart) {
        let user = await User.findById(req.user._id);
        let status = "pending";
        let confirmation = "pending";

        if (!user) {
          user = await Admin.findById(req.user._id);
          status = "success";
          confirmation = "approved";

          const detail = await Promise.all(
            cart.detail.map(async (detailItem) => {
              const newItem = {
                date: detailItem.date,
                item: [],
              };

              const fields = {};

              const dataField = await Promise.all(
                detailItem.item.map(async (item) => {
                  const field = await Field.findById(item.field);

                  // Ubah format jadwal sesuai kebutuhan
                  const formattedSchedule = item.schedule.map((schedule) => ({
                    userId: user._id,
                    name: user.username,
                    photo: user.avatar,
                    time: schedule,
                  }));

                  if (!fields[field.name]) {
                    fields[field.name] = {
                      fieldName: field.name,
                      schedule: [],
                    };
                  }

                  fields[field.name].schedule =
                    fields[field.name].schedule.concat(formattedSchedule);
                })
              );

              newItem.item = Object.values(fields);
              return newItem;
            })
          );

          detail.map(async (item) => {
            schedule = new Schedule(item);
            await schedule.save();
          });
        }

        const now = new Date();
        const hour = String(now.getHours()).padStart(2, "0"); // Mendapatkan jam (dalam format 24 jam)
        const minute = String(now.getMinutes()).padStart(2, "0"); // Mendapatkan menit

        const newData = {
          orderId: `FSL-${now.getTime()}`,
          user: user._id,
          detail: cart.detail,
          totalPrice: cart.totalPrice,
          orderDate: new Date().toLocaleDateString("en-CA"),
          orderTime: `${hour}:${minute}`,
          status,
          confirmation,
        };


        // Hapus data keranjang
        await Cart.deleteOne({ user: req.user._id });

        const order = new Order(newData);
        await order.save();

        res.status(201).json({ data: order });
      } else {
        res.status(400).json({ message: "Keranjang / Cart anda kosong.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  statusOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findOneAndUpdate(
        { orderId: id },
        { status },
        { new: true }
      );

      res.status(200).json({ data: order });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findOne({ orderId: id });

      if (order) {
        await Order.deleteOne({ orderId: id });
        res.status(200).json({ message: "Order Berhasil di hapus.!" });
      } else {
        res.status(403).json({ message: "Order ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  
};
