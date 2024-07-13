import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import { urlDB } from "../../config";
import fs from "fs";
import path from "path";
import {getAdminToken, getUserToken}  from './utility/token';

describe("user", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("user profile", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenUser = await getUserToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/user/profile")
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });
  
  describe("edit profile", () => {
    it("should return 200 and update successfully", async () => {
      const tokenUser = await getUserToken();
      
      const folderPath = path.join(__dirname, "images"); // Path ke direktori dengan file gambar
      const fileName = "test_image_avatar.jpg"; // Nama file gambar yang akan diunggah
      const imagePath = path.join(folderPath, fileName); // Path lengkap ke file gambar

      // Membaca konten file secara synchronous
      const fileContent = fs.readFileSync(imagePath);

      const dataUser = {
        fullName: "test1",
        username: "test1"
      }

      // response data
      const response = await supertest(app)
        .put("/api/v1/user/profile/edit")
        .set("Authorization", `Bearer ${tokenUser}`)
        .field('fullName', dataUser.fullName)
        .field('username', dataUser.username)
        .attach("image", fileContent, { filename: fileName })

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });


});
