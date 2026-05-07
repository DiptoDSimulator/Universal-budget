const CACHE = "dc-budget-v1";

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(clients.claim()));

self.addEventListener("push", e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/Ourbudget/icon-192.png",
      badge: data.badge || "/Ourbudget/icon-192.png",
      tag: data.tag || "dc-budget",
      data: { url: data.url || "/Ourbudget/" },
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data?.url || "/Ourbudget/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes("/Ourbudget/") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Background sync for scheduled reminders (where supported)
self.addEventListener("periodicsync", e => {
  if (e.tag === "dc-daily-reminder") {
    e.waitUntil(sendDailyReminder());
  }
  if (e.tag === "dc-weekly-reminder") {
    e.waitUntil(sendWeeklyReminder());
  }
});

async function sendDailyReminder() {
  await self.registration.showNotification("DC Budgeting 💰", {
    body: "Don't forget to log today's expenses!",
    icon: "/Ourbudget/icon-192.png",
    tag: "dc-daily",
    data: { url: "/Ourbudget/" }
  });
}

async function sendWeeklyReminder() {
  await self.registration.showNotification("DC Budgeting — Weekly Summary 📊", {
    body: "Check your weekly spending summary!",
    icon: "/Ourbudget/icon-192.png",
    tag: "dc-weekly",
    data: { url: "/Ourbudget/" }
  });
}
