import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import fs from "fs";
import path from "path";
import { urlDB } from "../../config";

import { getAdminToken, getUserToken } from "./utility/token";
import { addField, getOneExampleField } from "./utility/createData";

describe("field", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  var dataField;

  describe("get all field", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenUser = await getUserToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/field")
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0); // Memastikan panjang data lebih dari 0
    });
  });

  describe("add field", () => {
    it("should return 201 and add field successfully", async () => {
      const tokenAdmin = await getAdminToken();

      const response = await addField(tokenAdmin);

      dataField = response.body.data;

      // Verifikasi status respons
      expect(response.status).toBe(201);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("add rating field", () => {
    it("should return 200 and add rating successfully", async () => {
      const tokenUser = await getUserToken();

      const payload = {
        rating: [0, 0, 0, 0, 1], // rating Bintang 5
      };

      const field = await getOneExampleField(tokenUser);
      const idLapangan = field._id; // example idField

      // response data
      const response = await supertest(app)
        .post(`/api/v1/field/${idLapangan}/rating`)
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(payload);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("edit field futsal", () => {
    it("should return 200 and update field successfully", async () => {
      const tokenAdmin = await getAdminToken();

      const payload = {
        price: 220_000,
      };

      const field = await getOneExampleField(tokenAdmin);
      const idLapangan = field._id; // example idField

      const folderPath = path.join(__dirname, "images"); // Path ke direktori dengan file gambar
      const fileName = "test_image_field.png"; // Nama file gambar yang akan diunggah
      const imagePath = path.join(folderPath, fileName); // Path lengkap ke file gambar

      // Membaca konten file secara synchronous
      const fileContent = fs.readFileSync(imagePath);

      const response = await supertest(app)
        .put(`/api/v1/field/${idLapangan}/edit`)
        .set("Content-Type", "multipart/form-data")
        .set("Authorization", `Bearer ${tokenAdmin}`)
        .field("price", payload.price)
        .attach("image", fileContent, { filename: fileName });

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("add field as favorite", () => {
    it("should return 200 and add field as favorite successfully", async () => {
      const tokenUser = await getUserToken();

      const field = await getOneExampleField(tokenUser);
      const idLapangan = field._id; // example idField

      // response data
      const response = await supertest(app)
        .post(`/api/v1/field/${idLapangan}/favorite`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("delete a field as favorite", () => {
    it("should return 200 and delete a field as favorite successfully", async () => {
      const tokenUser = await getUserToken();

      const field = await getOneExampleField(tokenUser);
      const idLapangan = field._id; // example idField

      // response data
      const response = await supertest(app)
        .delete(`/api/v1/field/${idLapangan}/unfavorite`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("delete field futsal", () => {
    it("should return 200 and delete field successfully", async () => {
      const tokenAdmin = await getAdminToken();

      const idLapangan = dataField._id; // example idField

      // response data
      const response = await supertest(app)
        .delete(`/api/v1/field/${idLapangan}/delete`)
        .set("Authorization", `Bearer ${tokenAdmin}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);
    });
  });
});
