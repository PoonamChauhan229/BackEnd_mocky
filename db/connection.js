const mongoose = require("mongoose");
const User=require("../model/userModel");
const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connection;
