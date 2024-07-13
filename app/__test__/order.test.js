import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import { urlDB } from "../../config";
import fs from "fs";
import path from "path";
import { getAdminToken, getUserToken } from "./utility/token";
import { addOrder } from "./utility/createData";

describe("order", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  var orderUser;

  describe("create order", () => {
    it("should return 201 and create order successfully", async () => {
      const tokenUser = await getUserToken();

      // response data
      const response = await addOrder(tokenUser);

      // simpan data order untuk data pengujian edit dan delete cart
      orderUser = response.body.data;

      // Verifikasi status respons
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("order history user", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenUser = await getUserToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/order/history")
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("all order history ", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenAdmin = await getAdminToken();

      // response data
      const response = await supertest(app)
        .get("/api/v1/order/history/all")
        .set("Authorization", `Bearer ${tokenAdmin}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("update order status ", () => {
    it("should return 200 and update successfully", async () => {
      const tokenAdmin = await getAdminToken();

      const payload = {
        status: "success",
      };

      const orderId = orderUser.orderId; //example orderId

      // response data
      const response = await supertest(app)
        .put(`/api/v1/order/${orderId}/status`)
        .set("Authorization", `Bearer ${tokenAdmin}`)
        .send(payload);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("delete order", () => {
    it("should return 200 and delete order successfully", async () => {
      const tokenUser = await getUserToken();
      const tokenAdmin = await getAdminToken();

      // // Buat data order Baru
      // const responseNewOrderUser = await addOrder(tokenUser);
      // const newOrderUser = responseNewOrderUser.body.data;
      // const orderId = newOrderUser.orderId; //example new orderId User

      const orderId = orderUser.orderId; //example orderId

      // response data
      const response = await supertest(app)
        .delete(`/api/v1/order/${orderId}/delete`)
        .set("Authorization", `Bearer ${tokenAdmin}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);
    });
  });
});
