import { useState, useEffect } from "react";
import { getPushSubscription } from "./main";

const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function App() {
  const [status, setStatus] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [method, setMethod] = useState("mock"); // switch later to apify/ical

  async function testServer() {
    setStatus("Pinging server…");
    try {
      const res = await fetch(`${apiBase}/api/health`);
      const json = await res.json();
      setStatus(json.ok ? `Server OK — ${json.time}` : "Server not OK");
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Requesting push permission…");
    try {
      const pushSubscription = await getPushSubscription(apiBase);

      setStatus("Saving watch…");
      const payload = { listingUrl, start, end, method, pushSubscription };
      const res = await fetch(`${apiBase}/api/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setStatus(json.message || "Saved");
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  useEffect(() => { testServer(); }, []);

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4 bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-sky-700">Airbnb Date Watcher</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={testServer}
            className="rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700"
          >
            Test server
          </button>
          <span className="text-sm text-slate-600">{status}</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-600">Listing URL</span>
            <input
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              type="url"
              required
              placeholder="https://www.airbnb.com/rooms/123456"
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-600">Start date</span>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">End date</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-600">Method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="mock">Mock (testing)</option>
              <option value="apify">Apify (real)</option>
              <option value="ical">iCal (host-shared)</option>
            </select>
          </label>

          <button className="w-full rounded-lg bg-sky-600 text-white py-2 font-medium hover:bg-sky-700">
            Subscribe (enable notifications)
          </button>
        </form>
      </div>
    </div>
  );
}
