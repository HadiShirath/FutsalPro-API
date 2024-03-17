const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
  rootPath: path.resolve(__dirname, ".."),
  serviceName: process.env.SERVICE_NAME,
  urlDB: process.env.MONGODB_URL,
  jwtKey: process.env.JWT_KEY,
  urlMidtrans: process.env.URL_MIDTRANS,
  urlMidtransStatus: process.env.URL_MIDTRANS_STATUS,
  authorizationMidtrans: process.env.AUTHORIZATION_MIDTRANS,
};
