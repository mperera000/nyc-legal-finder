const OUTREACH_KEY = "nyc-legal-aid:outreach";
const LANGUAGE_KEY = "nyc-legal-aid:language";

export type OutreachStatus = "saved" | "contacted" | "org_replied";

export interface OutreachEntry {
  id: string;
  orgId: string;
  orgName: string;
  status: OutreachStatus;
  contactedDate: string | null;
  reminderDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function loadOutreach(): OutreachEntry[] {
  try {
    const raw = localStorage.getItem(OUTREACH_KEY);
    return raw ? (JSON.parse(raw) as OutreachEntry[]) : [];
  } catch {
    return [];
  }
}

function saveOutreach(entries: OutreachEntry[]): void {
  try {
    localStorage.setItem(OUTREACH_KEY, JSON.stringify(entries));
  } catch {
    throw new Error("storage_failed");
  }
}

export function addOutreach(
  data: Pick<OutreachEntry, "orgId" | "orgName">
): OutreachEntry {
  const existing = loadOutreach().find((e) => e.orgId === data.orgId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const entry: OutreachEntry = {
    ...data,
    id: crypto.randomUUID(),
    status: "saved",
    contactedDate: null,
    reminderDate: null,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  saveOutreach([...loadOutreach(), entry]);
  return entry;
}

export function updateOutreach(
  id: string,
  patch: Partial<OutreachEntry>
): void {
  const entries = loadOutreach().map((e) =>
    e.id === id
      ? { ...e, ...patch, updatedAt: new Date().toISOString() }
      : e
  );
  saveOutreach(entries);
}

export function deleteOutreach(id: string): void {
  saveOutreach(loadOutreach().filter((e) => e.id !== id));
}

export function isTracked(orgId: string): boolean {
  return loadOutreach().some((e) => e.orgId === orgId);
}

export function loadLanguage(): string {
  try {
    return localStorage.getItem(LANGUAGE_KEY) ?? "en";
  } catch {
    return "en";
  }
}

export function saveLanguage(lang: string): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // non-critical
  }
}
