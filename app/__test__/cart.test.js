import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import { urlDB } from "../../config";
import fs from "fs";
import path from "path";
import { getAdminToken, getUserToken } from "./utility/token";
import { addCart } from './utility/createData';

describe("cart", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  var cartUser;

  describe("get cart", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenUser = await getUserToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/cart")
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("add cart", () => {
    it("should return 201 and add cart successfully", async () => {
      const tokenUser = await getUserToken();

      // simpan data sebagai data pengujian edit dan delete cart
      const response = await addCart(tokenUser)
      cartUser = response.body.data

      // Verifikasi status respons
      expect(response.status).toBe(201);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("edit item cart", () => {
    it("should return 200 and update successfully", async () => {
      const tokenUser = await getUserToken();

      const payload = {
        schedule: ["08.00-09.00", "09.00-10.00", "10.00-11.00", "11.00-12.00"],
      };

      const detailCart = cartUser.detail[0];
      const itemCart = detailCart.item[0];

      const date = detailCart.date; //example date with format YYYY-MM-DD
      const itemId = itemCart._id; //example itemId in detail cart

      // response data
      const response = await supertest(app)
        .put(`/api/v1/cart/${date}/${itemId}/edit`)
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(payload);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("delete cart", () => {
    it("should return 200 and delete successfully", async () => {
      const tokenUser = await getUserToken();

      const detailCart = cartUser.detail[0];
      const itemCart = detailCart.item[0];

      const date = detailCart.date; //example date with format YYYY-MM-DD
      const itemId = itemCart._id; //example itemId in detail cart

      const response = await supertest(app)
        .delete(`/api/v1/cart/${date}/${itemId}/delete`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });
});
