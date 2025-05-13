const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const tokenAuth = async (req, res, next) => {
  console.log("Auth middleware is called");

  try {
    // Check if Authorization header exists
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).send({ message: "Authorization Header is Missing" });
    }

    // Extract the token from the header
    const token = authHeader.replace("Bearer ", "");

    // Verify the token
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user associated with the token
    const user = await User.findOne({ _id: decode._id });
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    // Attach user and token to the request object for further use
    req.token = token;
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (e) {
    console.error("Authentication Error:", e.message);
    res.status(401).send({ message: "Authentication Error", error: e.message });
  }
};

module.exports = tokenAuth;
