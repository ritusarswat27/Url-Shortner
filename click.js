const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: "Url", required: true },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

const Click = mongoose.model("Click", clickSchema);

module.exports = Click;
