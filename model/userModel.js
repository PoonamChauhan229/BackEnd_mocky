const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mockAPIs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockAPI'  // Reference to the MockAPI model
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  
});

// Generate Auth Token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET_KEY);
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
