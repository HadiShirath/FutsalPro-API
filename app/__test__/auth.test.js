import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import User from "../user/model";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import { urlDB } from "../../config";
import { v4 as uuid } from "uuid";
import { addUser, userData } from "./utility/createData";
import { userRegisterPayload } from "./utility/payload";

describe("auth", () => {
  beforeAll(() => {
    mongoose.connect(urlDB);
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  var dataUser;

  describe("admin - sign in", () => {
    it("should return 200 and get access token", async () => {
      const requestBody = {
        email: "adminfutsal@gmail.com",
        password: "12345678",
      };

      const response = await supertest(app)
        .post("/api/v1/admin/signin")
        .send(requestBody);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // console.log('token access admin : ',  response.body.data);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
      // Memastikan panjang data lebih dari 0
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 403 and password invalid", async () => {
      const requestBody = {
        email: "adminfutsal@gmail.com",
        password: "1234567",
      };

      const response = await supertest(app)
        .post("/api/v1/admin/signin")
        .send(requestBody);

      // Verifikasi status respons
      expect(response.status).toBe(403);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeUndefined();
    });
  });

  describe("user - sign up", () => {
    it("should return 422 and password invalid", async () => {
      const userData = {
        fullName: "test",
        email: `${uuid()}@example.com`,
        password: "1",
        username: "test",
        phoneNumber: "123456789",
        address: "123 Street, City",
        profession: "Developer",
      };

      const response = await supertest(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(422);

      // Periksa bahwa respons mengandung data yang kosong
      expect(response.body.data).toBeUndefined();
    });

    it("should return 201 and create a new user without avatar", async () => {
      const userData = userRegisterPayload();

      const response = await supertest(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(201);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });

    it("should return 201 and create a new user with avatar", async () => {
      const response = await addUser();

      // simpan data user sebagai data pengujian sign in
      const dataUserFromPayload = userRegisterPayload();
      dataUser = {
        ...response.body.data,
        password: dataUserFromPayload.password,
      };

      expect(response.status).toBe(201);

      // Periksa bahwa respons mengandung data yang tidak kosong
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
  });

  describe("user - sign in", () => {
    it("should return 200 and get access token", async () => {
      const requestBody = {
        email: dataUser.email,
        password: dataUser.password,
      };

      const response = await supertest(app)
        .post("/api/v1/auth/signin")
        .send(requestBody);

      // Verifikasi status respons
      expect(response.status).toBe(200);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeDefined();
      // Memastikan panjang data lebih dari 0
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 403 and password invalid", async () => {
      const requestBody = {
        email: dataUser.email,
        password: "1234567",
      };

      const response = await supertest(app)
        .post("/api/v1/auth/signin")
        .send(requestBody);

      // Verifikasi status respons
      expect(response.status).toBe(403);

      // Verifikasi bahwa data tidak kosong
      expect(response.body.data).toBeUndefined();
    });
  });
});
