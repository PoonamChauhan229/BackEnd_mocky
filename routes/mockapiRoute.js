const express = require("express");
const router = express.Router();
const tokenAuth = require("../middleware/tokenAuth");
const MockAPI = require("../model/mockapiModel");
const User = require("../model/userModel");

// 🔹 Create a new MockAPI
router.post("/create", tokenAuth, async (req, res) => {
  try {
    const { resourceName, endpoints } = req.body;

    const newMock = new MockAPI({
      userId: req.user._id,
      resources: [
        {
          resourceName,
          endpoints
        }
      ]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { mockAPIs: newMock._id }
    });

    await newMock.save();

    res.status(201).json({ message: "Mock API created", mock: newMock });
  } catch (err) {
    res.status(400).json({ message: "Creation failed", error: err.message });
  }
});


// 🔹 Get all mock APIs of the user
router.get("/my-mocks", tokenAuth, async (req, res) => {
  console.log(req.user._id)
// populate()
 const mocks = await MockAPI.find({ userId: req.user._id }).populate('endpoints'); // populate specific fields
  res.status(200).json(mocks);
});


// 🔹 Get single mock API
router.get("/resource/:mockId", tokenAuth, async (req, res) => {
  console.log(req.params.mockId)
  const mock = await MockAPI.findOne({ _id: req.params.mockId, userId: req.user._id });
  if (!mock) return res.status(404).json({ message: "Not found" });
  res.json(mock);
});

// 🔹 Add new endpoint to existing mock
router.post("/resources/endpoints/:mockId", tokenAuth, async (req, res) => {
  try {
    const { endpoints } = req.body;

    // Validate input
    if (!Array.isArray(endpoints) || endpoints.length === 0) {
      return res.status(400).json({ message: "Endpoints array is required and cannot be empty" });
    }

    // Find the existing mock by ID and user
    const mock = await MockAPI.findOne({
      _id: req.params.mockId,
      userId: req.user._id
    });

    if (!mock) return res.status(404).json({ message: "Mock not found" });

    // Push the new endpoints
    mock.endpoints.push(...endpoints);

    await mock.save();

    res.json({ message: "Endpoint(s) added successfully", mock });
  } catch (err) {
    console.error("Error adding endpoints:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// 🔹 Update specific endpoint by index
router.put("/:mockId/endpoints/:index", tokenAuth, async (req, res) => {
  const { method, urlpath, response } = req.body;
  const mock = await MockAPI.findOne({ _id: req.params.mockId, user: req.user._id });
  if (!mock) return res.status(404).json({ message: "Mock not found" });

  if (!mock.endpoints[req.params.index]) return res.status(404).json({ message: "Endpoint not found" });

  mock.endpoints[req.params.index] = { method, urlpath, response };
  await mock.save();
  res.json({ message: "Endpoint updated", mock });
});

// 🔹 Delete an endpoint by index
router.delete("/:mockId/endpoints/:index", tokenAuth, async (req, res) => {
  const mock = await MockAPI.findOne({ _id: req.params.mockId, user: req.user._id });
  if (!mock) return res.status(404).json({ message: "Mock not found" });

  if (mock.endpoints.length <= req.params.index) return res.status(400).json({ message: "Invalid index" });

  mock.endpoints.splice(req.params.index, 1);
  await mock.save();
  res.json({ message: "Endpoint deleted", mock });
});

// 🔹 Delete entire mock API
router.delete("/:mockId", tokenAuth, async (req, res) => {
  const mock = await MockAPI.findOneAndDelete({ _id: req.params.mockId, user: req.user._id });
  if (!mock) return res.status(404).json({ message: "Mock not found" });
  res.json({ message: "Mock deleted" });
});

module.exports = router;
