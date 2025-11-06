import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { initPush, sendPush } from "./lib/push.js";
import Watch from "./models/Watch.js";
import cron from "node-cron";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false,
  })
);
app.use(express.json());

const port = process.env.PORT || 4000;

// Init Web Push
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

// Create a watch, stores push subscription
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

// test push to a specific watch ID
app.post("/api/test-push/:id", async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id);
    if (!watch || !watch.pushSubscription?.endpoint) {
      return res
        .status(404)
        .json({ message: "Watch not found or no subscription" });
    }
    await sendPush(
      watch.pushSubscription,
      "Test notification 🔔",
      `This is a test push for watch ${watch._id}`
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to send push" });
  }
});

// Every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  console.log("⏰ Running mock availability check...");
  try {
    const watches = await Watch.find({ method: "mock" });
    for (const w of watches) {
      // 30% chance to simulate "listing opened"
      if (Math.random() < 0.3) {
        console.log(`📣 Mock trigger for watch ${w._id}`);
        await sendPush(
          w.pushSubscription,
          "Listing reopened 🏡",
          `Your tracked listing is open between ${w.start} and ${w.end}!`
        );
      }
    }
  } catch (err) {
    console.error("Mock check failed:", err.message);
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
