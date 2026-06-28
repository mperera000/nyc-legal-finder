export async function requestReminderPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleReminder(orgName: string, dateStr: string): void {
  const reminderTime = new Date(dateStr).getTime();
  const now = Date.now();
  const delay = reminderTime - now;
  if (delay <= 0) return;

  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("Time to follow up", {
        body: `Don't forget to follow up with ${orgName}.`,
        icon: "/favicon.ico",
      });
    }
  }, delay);
}

export function checkDueReminders(
  entries: Array<{ orgName: string; reminderDate: string | null }>
): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const today = new Date().toISOString().slice(0, 10);
  for (const entry of entries) {
    if (entry.reminderDate && entry.reminderDate.slice(0, 10) === today) {
      new Notification("Time to follow up", {
        body: `Don't forget to follow up with ${entry.orgName}.`,
        icon: "/favicon.ico",
      });
    }
  }
}
