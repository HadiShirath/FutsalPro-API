import supertest from "supertest";
import app from "../../../app";
import { addUser } from "./createData";

// Fungsi untuk mendapatkan token admin
export const getAdminToken = async () => {
  
  // akun email yang sudah terdaftar
  const requestBody = {
    email: "adminfutsal@gmail.com",
    password: "12345678",
  };

  const response = await supertest(app)
    .post("/api/v1/admin/signin")
    .send(requestBody)
    .expect(200);

  return response.body.data; // Mengembalikan token admin
};

// Fungsi untuk mendapatkan token user
export const getUserToken = async () => {

  // akun user yang sudah terdaftar
  const requestBody = {
    email: "james@gmail.com",
    password: "12345678",
  };

  const response = await supertest(app)
    .post("/api/v1/auth/signin")
    .send(requestBody)
    .expect(200);

  return response.body.data; // Mengembalikan token User
};
