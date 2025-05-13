const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
  urlpath: { type: String, required: true },
  description: { type: String, default: 'No description provided.' },
  response: { type: mongoose.Schema.Types.Mixed, required: true },
  statusCode: { type: Number, default: 200 }
}, { _id: false });

const resourceSchema = new mongoose.Schema({
  resourceName: { type: String, required: true },
  endpoints: [endpointSchema]
}, { _id: false });

const mockAPISchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: 'A mock API project.' },
  resources: [resourceSchema], // ✅ now multiple resources per mock
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MockAPI', mockAPISchema);