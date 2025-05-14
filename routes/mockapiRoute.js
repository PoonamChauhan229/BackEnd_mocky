const express = require("express");
const router = express.Router();
const tokenAuth = require("../middleware/tokenAuth");
const MockAPI = require("../model/mockapiModel");
const User = require("../model/userModel");

const auth = tokenAuth;

// Create a Resource with end points + Add a new resource for the same user

// router.post('/resources', auth, async (req, res) => {
//   try {
//     const { resourceName, endpoints = [] } = req.body;

//     // Step 1: Check if MockAPI exists for the user
//     let existingMockAPI = await MockAPI.findOne({ userId: req.user._id });

//     // Step 2: If no MockAPI exists, create one
//     if (!existingMockAPI) {
//       const newMockAPI = new MockAPI({
//         userId: req.user._id,
//         resources: [{
//           resourceName,
//           endpoints
//         }]
//       });

//       const savedResource = await newMockAPI.save();

//       // Link MockAPI ID to user's mockAPIs array
//       await User.findByIdAndUpdate(
//         req.user._id,
//         { $push: { mockAPIs: savedResource._id } },
//         { new: true }
//       );

//       return res.status(201).json(savedResource);
//     }

//     // Step 3: If MockAPI exists, check for duplicate resource
//     const duplicate = existingMockAPI.resources.find(
//       resource => resource.resourceName === resourceName
//     );

//     if (duplicate) {
//       return res.status(400).json({ message: 'Resource with the same name already exists.' });
//     }

//     // Step 4: Add the new resource
//     existingMockAPI.resources.push({ resourceName, endpoints });
//     const updatedMockAPI = await existingMockAPI.save();

//     return res.status(201).json(updatedMockAPI);
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// });


router.post('/resources', auth, async (req, res) => {
  try {
    const { resourceName, endpoints = [] } = req.body;

    // Check if this user already has a MockAPI with the same resource
    const existing = await MockAPI.findOne({
      userId: req.user._id,
      'resources.resourceName': resourceName
    });

    if (existing) {
      return res.status(400).json({ message: 'Resource with this name already exists.' });
    }

    // Create a new MockAPI document with this single resource
    const newMockAPI = new MockAPI({
      userId: req.user._id,
      resources: [{ resourceName, endpoints }]
    });

    const saved = await newMockAPI.save();

    // Optionally link this new mockAPI to the User's mockAPIs array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { mockAPIs: saved._id } }
    );

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add another endpoints to the existing resource
// POST /resources/:resourceId/endpoints
router.post('/resources/:resourceId/endpoints', auth, async (req, res) => {
  try {
    const { method, urlpath, description = 'No description provided.', response, statusCode = 200 } = req.body;

    const mockAPI = await MockAPI.findOne({
      userId: req.user._id,
     _id: req.params.resourceId
    });

    console.log(mockAPI,req.params.resourceId,req.user._id);

    if (!mockAPI) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const resource = mockAPI.resources.id(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found in mock API.' });
    }

    resource.endpoints.push({ method, urlpath, description, response, statusCode });

    await mockAPI.save();

    res.status(200).json({ message: 'Endpoint added successfully.', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





module.exports = router;
