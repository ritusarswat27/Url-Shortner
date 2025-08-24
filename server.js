const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { nanoid } = require("nanoid");
require("dotenv").config();

const Url = require("./models/url");
const Click = require("./models/click");

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Error:", err));


app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "URL is required" });

  const shortId = nanoid(6);

  const newUrl = new Url({ longUrl, shortId });
  await newUrl.save();

  res.json({ shortUrl: `${process.env.BASE_URL}/${shortId}` });
});

app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (!url) return res.status(404).json({ error: "URL not found" });


  await Click.create({
    urlId: url._id,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.redirect(url.longUrl);
});


app.get("/an/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (!url) return res.status(404).json({ error: "URL not found" });

  const clicks = await Click.find({ urlId: url._id });

  res.json({
    longUrl: url.longUrl,
    shortId: url.shortId,
    totalClicks: clicks.length,
    uniqueVisitors: new Set(clicks.map(c => c.ip)).size,
    analytics: clicks
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
