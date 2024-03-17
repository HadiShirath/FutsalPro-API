const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  date: {
    type: String,
  },
  item: [
    {
      fieldName: {
        type: String,
      },
      schedule: [
        {
          userId: {
            type: String,
          },
          name: {
            type: String,
          },
          photo: {
            type: String,
          },
          time: {
            type: String,
          },
        },
      ],
    },
  ],
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
