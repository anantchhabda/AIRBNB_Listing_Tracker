import webpush from "web-push";

export function initPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPush(sub, title, body) {
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title, body }));
  } catch (e) {
    console.warn("Push failed", e?.statusCode || e?.message);
  }
}
