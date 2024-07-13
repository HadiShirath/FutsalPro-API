import { getOneExampleField } from "./createData";
import { getAdminToken, getUserToken } from "./token";
import { v4 as uuid } from "uuid";

export const userRegisterPayload = () => {
  const userData = {
    fullName: "test",
    email: `${uuid()}@example.com`,
    password: "12345678",
    username: "test",
    phoneNumber: "123456789",
    address: "123 Street, City",
    profession: "Developer",
  };

  return userData;
};

export const cartPayload = (idLapangan) => {
  const payload = {
    detail: [
      {
        date: "2024-03-01",
        item: [
          {
            field: `${idLapangan}`,
            schedule: ["08.00-09.00", "10.00-11.00", "11.00-12.00"],
          },
          {
            field: `${idLapangan}`,
            schedule: ["15.00-16.00", "17.00-18.00"],
          },
        ],
      },
      {
        date: "2024-03-02",
        item: [
          {
            field: `${idLapangan}`,
            schedule: ["08.00-09.00", "09.00-10.00"],
          },
        ],
      },
    ],
  };

  return payload;
};

export const fieldPayload = () => {
    const fieldData = {
        name: "rumput",
        desc: "Lapangan rumput kami adalah pilihan ideal untuk para penggemar olahraga yang mencari fasilitas berkualitas untuk latihan atau pertandingan di luar ruangan. Dengan permukaan yang natural dan tahan lama, lapangan rumput kami memberikan pengalaman bermain yang mirip dengan bermain di lapangan alami",
        price: 200_000,
        facilities: "wifi",
        category: "pagi-sore",
      };

      return fieldData
}