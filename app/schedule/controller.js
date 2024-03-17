const Order = require("../order/model");
const Schedule = require("./model");
const Field = require("../field/model");
const User = require("../user/model");

module.exports = {
  schedule: async (req, res) => {
    try {
      const { id } = req.params;

      const schedule = await Schedule.findOne({ date: id });

      res.status(200).json({ data: schedule });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  approvedSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findOne({ orderId: id });

      if (order.confirmation === "approved") {
        return res.status(200).json({
          confirmation: "approved",
          message: "Pesanan sudah di approved.!",
        });
      }

      if (order) {
        const user = await User.findById(order.user);

        if (user) {
          const detail = await Promise.all(
            order.detail.map(async (detailItem) => {
              const newItem = {
                date: detailItem.date,
                item: [],
              };

              const fields = {};

              const dataField = await Promise.all(
                detailItem.item.map(async (item) => {
                  const field = await Field.findById(item.field);

                  // Ubah format jadwal sesuai kebutuhan
                  const formattedSchedule = item.schedule.map((schedule) => ({
                    userId: user._id,
                    name: user.username,
                    photo: user.avatar,
                    time: schedule,
                  }));

                  if (!fields[field.name]) {
                    fields[field.name] = {
                      field: field._id,
                      fieldName: field.name,
                      schedule: [],
                    };
                  }

                  fields[field.name].schedule =
                    fields[field.name].schedule.concat(formattedSchedule);
                })
              );

              newItem.item = Object.values(fields);
              return newItem;
            })
          );

          let dataAll = [];
          let filteredData = [];

          await Promise.all(
            detail.map(async (item) => {
              checkDate = await Schedule.findOne({ date: item.date });

              if (checkDate) {
                const datafilter = filterDataApprove(item, checkDate);

                if (datafilter) {
                  filteredData.push(datafilter);
                }

                const resultMerge = mergeData(checkDate, item);

                dataAll.push(resultMerge);

                await Schedule.updateOne(
                  { date: item.date },
                  { item: resultMerge.item }
                );
              } else {
                filteredData.push(item);
                schedule = new Schedule(item);
                await schedule.save();
              }
            })
          );

          let confirmation = "rejected";
          let messageConfirmation = "Jadwal yang anda pesan sudah terisi.!";

          if (filteredData.length) {
            confirmation = "approved";
            messageConfirmation = "Jadwal yang disetujui";

            order.detail = filteredData.map((item) => {
              let dataItems = [];

              dataItems = item.item.map((dataItem) => {
                const schedule = dataItem.schedule.map(
                  (schedule) => schedule.time
                );
                return {
                  ...dataItem,
                  schedule: schedule,
                };
              });

              return {
                ...item,
                item: dataItems,
              };
            });

            await handlePrice(order);
          }

          const orders = await Order.findOneAndUpdate(
            { orderId: id },
            {
              confirmation: confirmation,
              detail: order.detail,
              totalPrice: order.totalPrice,
            },
            { new: true }
          );

          res.status(200).json({
            confirmation: confirmation,
            message: messageConfirmation,
            data: orders,
          });
        } else {
          res.status(403).json({ message: "Data User tidak ditemukan.!" });
        }
      } else {
        res.status(403).json({ message: "Order ID tidak ditemukan.!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
  cancelSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      let result = [];

      const order = await Order.findOne({ orderId: id, user: req.user._id });
      if (!order) throw new Error("Order ID tidak ditemukan.!");

      let detail = order.detail;

      await Promise.all(
        detail.map(async (item) => {
          checkDate = await Schedule.findOne({ date: item.date });

          if (checkDate) {
            const filteredData = await filterDataSchedule(checkDate, detail);

            result = await Schedule.findOneAndUpdate(
              { date: item.date },
              { item: filteredData },
              { new: true }
            );

            // jika data schedule kosong, Hapus data schedule
            if (
              result &&
              result.item.length === 1 &&
              !result.item[0].schedule.length
            ) {
              await Schedule.deleteOne({ date: item.date });
            }
          }
        })
      );

      // hapus data order
      await Order.deleteOne({ orderId: id });

      res.status(200).json({ message: "Jadwal Berhasil dibatalkan.!" });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  },
};

const mergeData = (data1, data2) => {
  if (data1.date !== data2.date) throw new Error("Tanggal data tidak cocok");

  const mergedItem = [];

  const addToMergedItem = (item, field) => {
    const existingItem = mergedItem.find((entry) => entry.fieldName === field);
    if (existingItem) {
      const mergedSchedule = existingItem.schedule.concat(item.schedule);
      existingItem.schedule = removeDuplicateTimes(mergedSchedule);
    } else {
      mergedItem.push(item);
    }
  };

  const removeDuplicateTimes = (schedule) => {
    const uniqueTimes = {};
    schedule.forEach((entry) => {
      // Jika waktu belum ada dalam objek uniqueTimes, tambahkan entri
      if (!uniqueTimes.hasOwnProperty(entry.time)) {
        uniqueTimes[entry.time] = entry;
      } else {
        // Jika waktu sudah ada, bandingkan _id untuk menentukan entri mana yang lebih lama
        const existingEntry = uniqueTimes[entry.time];
        if (entry._id < existingEntry._id) {
          // Jika entri yang baru memiliki _id yang lebih kecil, ganti entri yang ada
          uniqueTimes[entry.time] = entry;
        }
      }
    });
    return Object.values(uniqueTimes);
  };

  data1.item.forEach((item) => addToMergedItem(item, item.fieldName));
  data2.item.forEach((item) => addToMergedItem(item, item.fieldName));

  return { date: data1.date, item: mergedItem };
};

const filterDataApprove = (data1, data2) => {
  if (data1.date === data2.date) {
    const filteredItem = data1.item
      .map((item) => {
        if (
          data2.item.some((data2Item) => data2Item.fieldName === item.fieldName)
        ) {
          // Buang jadwal yang memiliki waktu yang sama dengan data2
          const filteredSchedule = item.schedule.filter((scheduleItem) => {
            return !data2.item.some((data2Item) => {
              return (
                data2Item.fieldName === item.fieldName &&
                data2Item.schedule.some((data2Schedule) => {
                  return data2Schedule.time === scheduleItem.time;
                })
              );
            });
          });
          // Periksa apakah filteredSchedule tidak kosong
          if (filteredSchedule.length > 0) {
            return { field: item.field, schedule: filteredSchedule };
          }
        } else {
          // Jika bidang tidak cocok dengan data2, biarkan item tidak berubah
          return item;
        }
      })
      .filter((item) => item !== null && item !== undefined); // Hilangkan item yang null dan undefined

    const filteredData = { date: data1.date, item: filteredItem };

    if (filteredData.item.length) {
      return filteredData;
    }
  } else {
    // Jika tanggal tidak cocok dengan data2, biarkan item tidak berubah
    return data1;
  }
};

const handlePrice = async (data) => {
  let totalPrice = 0;
  await Promise.all(
    data.detail.map(async (detail) => {
      await Promise.all(
        detail.item.map(async (item) => {
          const field = await Field.findById(item.field).select(
            "name category price photo"
          );

          item.field = field;
          item.price = field.price * item.schedule.length;
        })
      );

      detail.price = detail.item.reduce((acc, curr) => acc + curr.price, 0);
      totalPrice += detail.price;
    })
  );

  data.totalPrice = totalPrice;

  return data;
};

const filterDataSchedule = async (data1, data2) => {
  // Temukan item yang sesuai di data2 berdasarkan tanggal
  const matchingData2 = data2.find((item2) => item2.date === data1.date);

  // Jika data2 yang sesuai ditemukan
  if (matchingData2) {
    // Ekstrak waktu jadwal dari data2
    const scheduleTimes = await Promise.all(
      matchingData2.item
        .map(async (schedule) => {
          const field = await Field.findById(schedule.field);
          return {
            field: field.name,
            schedule: schedule.schedule,
          };
        })
        .flat()
    );

    console.log(JSON.stringify(scheduleTimes, null, 2));

    const newData = data1.item.map((detail) => {
      // Filter waktu jadwal yang cocok dengan data1
      const matchedFilter = scheduleTimes.find(
        (item) => item.field === detail.fieldName
      );
      if (matchedFilter) {
        // Buang jadwal yang sesuai dengan filter saat ini
        detail.schedule = detail.schedule.filter(
          (schedule) => !matchedFilter.schedule.includes(schedule.time)
        );
      }
      return detail;
    });

    return newData;
  }
  return [];
};
