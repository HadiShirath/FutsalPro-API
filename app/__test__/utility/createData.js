import supertest from "supertest";
import app from "../../../app.js";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { userRegisterPayload, cartPayload, fieldPayload } from "./payload";

export const addUser = async () => {
  const userData = userRegisterPayload();

  const folderPath = path.join(__dirname, "../images"); // Path ke direktori dengan file gambar
  const fileName = "test_image_avatar.jpg"; // Nama file gambar yang akan diunggah
  const imagePath = path.join(folderPath, fileName); // Path lengkap ke file gambar

  // Membaca konten file secara synchronous
  const fileContent = fs.readFileSync(imagePath);

  const response = await supertest(app)
    .post("/api/v1/auth/signup")
    .set("Content-Type", "multipart/form-data")
    .field("fullName", userData.fullName)
    .field("email", userData.email)
    .field("password", userData.password)
    .field("username", userData.username)
    .field("phoneNumber", userData.phoneNumber)
    .field("address", userData.address)
    .field("profession", userData.profession)
    .attach("image", fileContent, { filename: fileName })
    .expect(201);

  return response;
};

export const addCart = async (tokenUser) => {
  const field = await getOneExampleField(tokenUser);
  const idLapangan = field._id; // example idField

  const payload = cartPayload(idLapangan);

  const response = await supertest(app)
    .post(`/api/v1/cart/create`)
    .set("Authorization", `Bearer ${tokenUser}`)
    .send(payload)
    .expect(201);

  return response;
};

export const addOrder = async (tokenUser) => {
  const responseCart = await addCart(tokenUser);

  const response = await supertest(app)
    .post("/api/v1/order/create")
    .set("Authorization", `Bearer ${tokenUser}`)
    .expect(201);

  return response;
};

export const addField = async (tokenAdmin) => {
  const fieldData = fieldPayload();

  const folderPath = path.join(__dirname, "../images"); // Path ke direktori dengan file gambar
  const fileName = "test_image_field.png"; // Nama file gambar yang akan diunggah
  const imagePath = path.join(folderPath, fileName); // Path lengkap ke file gambar

  // Membaca konten file secara synchronous
  const fileContent = fs.readFileSync(imagePath);

  const response = await supertest(app)
    .post("/api/v1/field/create")
    .set("Content-Type", "multipart/form-data")
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .field("name", fieldData.name)
    .field("desc", fieldData.desc)
    .field("price", fieldData.price)
    .field("facilities", fieldData.facilities)
    .field("category", fieldData.category)
    .attach("image", fileContent, { filename: fileName })
    .expect(201);

  return response;
};

export const getOneExampleField = async (tokenAdminUser) => {
  const responseField = await supertest(app)
    .get("/api/v1/field")
    .set("Authorization", `Bearer ${tokenAdminUser}`);

  var dataField;

  if (responseField.status == 200) {
    dataField = responseField.body.data[0];
  } else if (response.status == 400 || response.status == 404) {
    const newDataField = await addField(tokenAdminUser);
    dataField = newDataField.body.data;
  }

  return dataField;
};

