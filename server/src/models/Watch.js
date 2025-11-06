import mongoose from "mongoose";

const WatchSchema = new mongoose.Schema(
  {
    listingUrl: { type: String, required: true },
    start: { type: String, required: true }, // yyyy-mm-dd
    end: { type: String, required: true }, // yyyy-mm-dd
    method: { type: String, enum: ["mock", "apify", "ical"], default: "mock" },
    icalUrl: { type: String },
    pushSubscription: {
      endpoint: String,
      keys: { p256dh: String, auth: String },
    },
    lastSeenAvailable: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Watch", WatchSchema);
