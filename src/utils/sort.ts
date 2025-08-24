import dayjs from 'dayjs';

// Common date-like fields to try in priority order
const DATE_FIELDS = [
  'updatedAt',
  'createdAt',
  'date',
  'licenseExpiryDate',
  'lastServiceDate',
  'endContractDate',
  'timestamp',
  'created_at',
  'updated_at',
];

function toTime(value: any): number {
  if (value == null) return 0;
  const d = dayjs(value);
  return d.isValid() ? d.valueOf() : 0;
}

function getRecencyValue(obj: Record<string, any>): number {
  // 1) Try common fields first (fast path)
  for (const key of DATE_FIELDS) {
    if (key in obj) {
      const t = toTime(obj[key]);
      if (t) return t;
    }
  }
  // 2) Try any key that looks like a date/time field
  for (const [k, v] of Object.entries(obj)) {
    if (/(date|time|At)$/i.test(k)) {
      const t = toTime(v);
      if (t) return t;
    }
  }
  // 3) Fallback to numeric id if available, else 0
  const id = (obj as any).id;
  const idNum = typeof id === 'number' ? id : Number(id);
  return Number.isFinite(idNum) ? idNum : 0;
}

export function sortNewestFirst<T extends Record<string, any>>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ra = getRecencyValue(a);
    const rb = getRecencyValue(b);
    if (rb !== ra) return rb - ra;

    // Tie-breaker 1: try common explicit fields again in a fixed order
    const ta = toTime((a as any).updatedAt ?? (a as any).createdAt ?? (a as any).date ?? (a as any).timestamp);
    const tb = toTime((b as any).updatedAt ?? (b as any).createdAt ?? (b as any).date ?? (b as any).timestamp);
    if (tb !== ta) return tb - ta;

    // Tie-breaker 2: numeric id descending, if both are numeric-like
    const aId = (a as any).id;
    const bId = (b as any).id;
    const aNum = typeof aId === 'number' ? aId : Number(aId);
    const bNum = typeof bId === 'number' ? bId : Number(bId);
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return bNum - aNum;

    // Tie-breaker 3: string id descending (to keep order deterministic)
    if (aId != null && bId != null) return String(bId).localeCompare(String(aId));

    return 0;
  });
}

export { getRecencyValue };
