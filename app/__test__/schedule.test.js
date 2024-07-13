import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import FieldModel from "../field/model.js";
import { urlDB } from "../../config";
import fs from "fs";
import path from "path";
import { getAdminToken, getUserToken } from "./utility/token";
import { addOrder } from "./utility/createData";

describe("schedule", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  var orderUser;

  describe("get schedule by date", () => {
    it("should return 200 and non-empty data", async () => {
      const tokenUser = await getUserToken();

      const date = "2024-03-01";

      // response data
      const response = await supertest(app)
        .get(`/api/v1/schedule/${date}`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("add reminder schedule", () => {
    it("should return 200 and add reminder successfully", async () => {
      const tokenUser = await getUserToken();

      const payload = {
        reminder: "2024-03-03, 13.13 WIB",
      };

      // Buat data order Baru
      const responseNewOrderUser = await addOrder(tokenUser);
      orderUser = responseNewOrderUser.body.data;
      const orderId = orderUser.orderId; //example new orderId User

      // response data
      const response = await supertest(app)
        .post(`/api/v1/schedule/${orderId}/reminder`)
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(payload);

      // // Verifikasi status respons
      expect(response.status).toBe(200);
    });
  });

  describe("delete reminder schedule", () => {
    it("should return 200 and delete reminder successfully", async () => {
      const tokenUser = await getUserToken();

      const orderId = orderUser.orderId; //example orderId FSL-XXXX

      // response data
      const response = await supertest(app)
        .delete(`/api/v1/schedule/${orderId}/reminder/delete`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // // Verifikasi status respons
      expect(response.status).toBe(200);
    });
  });

  describe("approved order schedule", () => {
    it("should return 200 and approved order schedule", async () => {
      const tokenUser = await getUserToken();
      const tokenAdmin = await getAdminToken();

      const orderId = orderUser.orderId; //example orderId FSL-XXXX

      const response = await supertest(app)
        .post(`/api/v1/schedule/${orderId}/create`)
        .set("Authorization", `Bearer ${tokenAdmin}`);

      // // // Verifikasi status respons
      expect(response.status).toBe(200);
      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("midtrans payment", () => {
    it("should return 200 and payment successfully", async () => {
      const tokenUser = await getUserToken();

      const orderId = orderUser.orderId; //example new orderId User

      // response data
      const response = await supertest(app)
        .post(`/api/v1/payment/${orderId}/transactions`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("status payment", () => {
    it("should return 200 and payment successfully", async () => {
      const tokenUser = await getUserToken();

      const orderId = orderUser.orderId; //example new orderId User

      // response data
      const response = await supertest(app)
        .get(`/api/v1/payment/${orderId}/status`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
    });
  });

  describe("cancel schedule", () => {
    it("should return 200 and cancel schedule successfully", async () => {
      const tokenUser = await getUserToken();

      const orderId = orderUser.orderId; //example orderId FSL-XXXX

      // response data
      const response = await supertest(app)
        .delete(`/api/v1/schedule/${orderId}/cancel`)
        .set("Authorization", `Bearer ${tokenUser}`);

      // Verifikasi status respons
      expect(response.status).toBe(200);
    });
  });
});
