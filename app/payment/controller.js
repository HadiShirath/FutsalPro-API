const axios = require("axios");
const config = require("../../config");
const Order = require("../order/model");
const User = require("../user/model");

module.exports = {
  payment: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findOne({ orderId: id }).select(
        "orderId totalPrice confirmation"
      );

      if (order) {
        if (order.confirmation === "rejected") {
          return res.status(403).json({
            status_confirmation: "rejected",
            message: "Order ID tidak memiliki data.!",
          });
        } else if (order.confirmation === "pending") {
          return res.status(403).json({
            status_confirmation: "pending",
            message:
              "Order ID dalam status menunggu konfirmasi persetujuan ADMIN.!",
          });
        }

        const user = await User.findById(req.user._id);

        const URL_MIDTRANS = config.urlMidtrans;

        const HEADER_MIDTRANS = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: config.authorizationMidtrans,
        };

        const data = {
          transaction_details: {
            order_id: order.orderId,
            gross_amount: order.totalPrice,
          },
          credit_card: {
            secure: true,
          },
          customer_details: {
            first_name: user.fullName,
            email: user.email,
            phone: user.phoneNumber,
          },
        };

        axios({
          method: "post",
          url: URL_MIDTRANS,
          headers: HEADER_MIDTRANS,
          data: data,
        })
          .then(async (response) => {
            const order = await Order.findOneAndUpdate(
              { orderId: id },
              { urlPayment: response.data.redirect_url },
              { new: true }
            );
            res.status(200).json({ data: order });
          })
          .catch((error) => {
            res.status(400).json({ message: error.message });
          });
      } else {
        res.status(403).json({ message: "Order ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  statusPayment: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findOne({ orderId: id });

      if (order) {
        const URL_MIDTRANS_STATUS = config.urlMidtransStatus;

        const HEADER_MIDTRANS = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: config.authorizationMidtrans,
        };

        axios({
          method: "get",
          url: `${URL_MIDTRANS_STATUS}/${id}/status`,
          headers: HEADER_MIDTRANS,
        })
          .then(async (response) => {
            const transactionStatus =
              response.data.transaction_status === "settlement"
                ? "success"
                : response.data.transaction_status;

            const order = await Order.findOneAndUpdate(
              { orderId: id },
              { status: transactionStatus },
              { new: true }
            );
            res.status(200).json({ data: order });
          })
          .catch((error) => {
            res.status(400).json({ message: error.message });
          });
      } else {
        res.status(403).json({ message: "Order ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};
