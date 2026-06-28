"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  loadOutreach,
  updateOutreach,
  deleteOutreach,
  type OutreachEntry,
  type OutreachStatus,
} from "@/lib/storage";
import { requestReminderPermission, scheduleReminder } from "@/lib/notifications";
import orgsData from "@/data/orgs.json";

type Org = (typeof orgsData)[number];

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const STATUS_BADGE: Record<OutreachStatus, string> = {
  saved: "bg-gray-100 text-gray-600 border-gray-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  org_replied: "bg-green-100 text-green-800 border-green-200",
};

function OrgInfoPanel({ org }: { org: Org }) {
  const { t, i18n } = useTranslation();
  const notes = i18n.language === "es" ? org.notes_es : org.notes_en;
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 text-sm">
      <p className="text-gray-600 leading-relaxed">{notes}</p>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{t("orgs.phone")}</p>
          <a href={`tel:${org.phone}`} className="text-indigo-700 hover:underline">{org.phone}</a>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{t("orgs.hours")}</p>
          <p className="text-gray-700">{org.hours}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{t("orgs.languages")}</p>
          <p className="text-gray-700">{org.languages.join(", ")}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{t("orgs.income_limit", { pct: org.incomeLimit_pct_fpl })}</p>
          {org.walkIns && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ {t("orgs.walk_ins")}</span>
          )}
        </div>
      </div>
      <a
        href={org.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-indigo-700 hover:underline self-start"
      >
        {t("orgs.website")} ↗
      </a>
    </div>
  );
}

function EntryCard({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: OutreachEntry;
  onUpdate: (id: string, patch: Partial<OutreachEntry>) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [showOrgInfo, setShowOrgInfo] = useState(false);
  const org = orgsData.find((o) => o.id === entry.orgId) ?? null;
  const overdue = entry.status === "contacted" && daysSince(entry.contactedDate) >= 5;

  async function handleReminderChange(date: string) {
    onUpdate(entry.id, { reminderDate: date || null });
    if (date) {
      const granted = await requestReminderPermission();
      if (granted) scheduleReminder(entry.orgName, date);
    }
  }

  function markContacted() {
    onUpdate(entry.id, {
      status: "contacted",
      contactedDate: new Date().toISOString(),
    });
  }

  function markOrgReplied() {
    onUpdate(entry.id, { status: "org_replied", reminderDate: null });
  }

  function resetEntry() {
    onUpdate(entry.id, {
      status: "saved",
      contactedDate: null,
      reminderDate: null,
    });
  }

  return (
    <article
      className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 ${
        overdue ? "border-yellow-300" : "border-gray-200"
      }`}
    >
      {/* Header: name + status badge + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            {entry.orgName}
          </h3>
          <span
            className={`self-start text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[entry.status]}`}
          >
            {t(`tracker.status_${entry.status}`)}
          </span>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
          aria-label={`${t("tracker.remove")} ${entry.orgName}`}
        >
          {t("tracker.remove")}
        </button>
      </div>

      {/* Org info toggle */}
      {org && (
        <div>
          <button
            onClick={() => setShowOrgInfo((v) => !v)}
            className="text-xs font-medium text-indigo-700 hover:text-indigo-900 transition-colors"
            aria-expanded={showOrgInfo}
          >
            {showOrgInfo ? "▾ Hide org info" : "▸ View org info (phone, hours, website)"}
          </button>
          {showOrgInfo && <div className="mt-2"><OrgInfoPanel org={org} /></div>}
        </div>
      )}

      {/* Overdue warning — only when contacted with no reply */}
      {overdue && (
        <p className="text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          ⚠ {t("tracker.overdue_label", { days: daysSince(entry.contactedDate) })}
        </p>
      )}

      {/* Resolved state */}
      {entry.status === "org_replied" && (
        <p className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ {t("tracker.resolved_label")}
        </p>
      )}

      {/* Notes — always visible */}
      <textarea
        value={entry.notes}
        onChange={(e) => onUpdate(entry.id, { notes: e.target.value })}
        placeholder={t("tracker.notes_placeholder")}
        rows={2}
        className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full resize-none focus:outline-none focus:border-indigo-400 placeholder-gray-400"
        aria-label={`Notes for ${entry.orgName}`}
      />

      {/* Context-aware actions */}
      {entry.status === "saved" && (
        <div className="pt-1 border-t border-gray-100">
          <button
            onClick={markContacted}
            className="w-full text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors px-4 py-2.5 rounded-xl"
          >
            📞 {t("tracker.mark_contacted")}
          </button>
        </div>
      )}

      {entry.status === "contacted" && (
        <div className="flex flex-col gap-3 pt-1 border-t border-gray-100">
          {/* Date I contacted them */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">
              {t("tracker.contacted_date")}
            </label>
            <input
              type="date"
              value={entry.contactedDate ? entry.contactedDate.slice(0, 10) : ""}
              onChange={(e) =>
                onUpdate(entry.id, {
                  contactedDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 bg-white"
            />
          </div>

          {/* Follow up reminder */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-1">
              {t("tracker.followup_reminder")}
            </label>
            <input
              type="date"
              value={entry.reminderDate ? entry.reminderDate.slice(0, 10) : ""}
              onChange={(e) => handleReminderChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">{t("tracker.followup_reminder_hint")}</p>
          </div>

          {/* Org followed up */}
          <button
            onClick={markOrgReplied}
            className="w-full text-sm font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors px-4 py-2.5 rounded-xl"
          >
            ✓ {t("tracker.mark_org_replied")}
          </button>
        </div>
      )}

      {entry.status === "org_replied" && (
        <div className="pt-1 border-t border-gray-100">
          <button
            onClick={resetEntry}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            {t("tracker.reset")}
          </button>
        </div>
      )}
    </article>
  );
}

export default function TrackerScreen() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<OutreachEntry[]>([]);

  useEffect(() => {
    setEntries(loadOutreach());
  }, []);

  function handleUpdate(id: string, patch: Partial<OutreachEntry>) {
    updateOutreach(id, patch);
    setEntries(loadOutreach());
  }

  function handleDelete(id: string) {
    deleteOutreach(id);
    setEntries(loadOutreach());
  }

  const overdue = entries.filter(
    (e) => e.status === "contacted" && daysSince(e.contactedDate) >= 5
  );
  const active = entries.filter((e) => e.status !== "org_replied");
  const resolved = entries.filter((e) => e.status === "org_replied");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("tracker.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("tracker.subtitle")}</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
          <p className="text-2xl mb-3">📋</p>
          <p>{t("tracker.empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Needs follow-up first */}
          {overdue.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" aria-hidden="true" />
                {t("home.needs_attention")}
              </h2>
              <div className="flex flex-col gap-4">
                {overdue.map((e) => (
                  <EntryCard key={e.id} entry={e} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {/* Active (non-overdue, non-resolved) */}
          {active.filter((e) => !overdue.includes(e)).length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                {t("tracker.title")}
              </h2>
              <div className="flex flex-col gap-4">
                {active
                  .filter((e) => !overdue.includes(e))
                  .map((e) => (
                    <EntryCard key={e.id} entry={e} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
              </div>
            </section>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
                {t("tracker.status_org_replied")}
              </h2>
              <div className="flex flex-col gap-4">
                {resolved.map((e) => (
                  <EntryCard key={e.id} entry={e} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
