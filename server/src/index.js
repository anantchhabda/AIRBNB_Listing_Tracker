import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { initPush } from "./lib/push.js";
import Watch from "./models/Watch.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const port = process.env.PORT || 4000;

// Init push
initPush();

// Connect Mongo
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Mongo connected");
} catch (err) {
  console.warn("Mongo connection failed:", err.message);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/public-vapid", (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Minimal watch endpoint
app.post("/api/watch", async (req, res) => {
  try {
    const { listingUrl, start, end, method, icalUrl, pushSubscription } =
      req.body;
    if (!listingUrl || !start || !end || !pushSubscription?.endpoint) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const doc = await Watch.create({
      listingUrl,
      start,
      end,
      method: method || "mock",
      icalUrl,
      pushSubscription,
      lastSeenAvailable: [],
    });
    res.json({ id: doc._id.toString(), message: "Watching this listing!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
