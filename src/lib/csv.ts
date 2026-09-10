export type CsvTable = { headers: string[]; rows: string[][] };

/** Minimal RFC4180-ish CSV parser (handles quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): CsvTable {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };

  const src = text.replace(/^\uFEFF/, "");

  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      pushField();
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      pushRow();
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  pushRow();

  const headers = (rows.shift() ?? []).map((h) => h.trim());
  return { headers, rows };
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const GUESSES: Record<string, string[]> = {
  name: ["name", "customer", "customer name", "full name", "client", "client name", "contact"],
  email: ["email", "e-mail", "email address", "mail"],
  phone: ["phone", "mobile", "telephone", "phone number", "cell"],
  service_type: ["service", "service type", "job", "job type", "type"],
  completed_at: ["date", "completed", "completed date", "completed at", "job date", "closed"],
};

export function guessMapping(headers: string[]) {
  const result: Record<string, string> = {
    name: "",
    email: "",
    phone: "",
    service_type: "",
    completed_at: "",
  };
  for (const [field, candidates] of Object.entries(GUESSES)) {
    const hit = headers.find((h) => candidates.includes(h.trim().toLowerCase()));
    if (hit) result[field] = hit;
  }
  return result;
}
