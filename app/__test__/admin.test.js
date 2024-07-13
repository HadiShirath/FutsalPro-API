import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import { urlDB } from "../../config";
import fs from "fs";
import path from "path";
import {getAdminToken, getUserToken}  from './utility/token';

describe("admin", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("all users", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenAdmin = await getAdminToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tokenAdmin}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.payload).toBeDefined();
    });
  });
 
});
