const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("../user/model");
const Admin = require("../admin/model");

module.exports = {
  isLoginAdmin: async (req, res, next) => {
    try {
      const token = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null;

      const dataUser = jwt.verify(token, config.jwtKey);

      const admin = await Admin.findById(dataUser.id);

      if (!admin) {
        throw new Error();
      }

      req.user = admin;
      req.token = token;
      next();
    } catch (err) {
      res.status(401).json({
        message: "No Authorized to access this resource, only ADMIN has access",
      });
    }
  },
  isLogin: async (req, res, next) => {
    try {
      const token = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null;

      const dataUser = jwt.verify(token, config.jwtKey);

      let data = {};

      const user = await User.findById(dataUser.id);

      if (user) {
        data = user;
      } else {
        const admin = await Admin.findById(dataUser.id);
        data = admin;
      }

      if (!data) {
        throw new Error();
      }

      req.user = data;
      req.token = token;
      next();
    } catch (err) {
      res
        .status(401)
        .json({ message: "No Authorized to access this resource" });
    }
  },
};
