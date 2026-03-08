/**
 * Parse a CSV File object into { headers, rows }
 * rows is an array of objects keyed by header names
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          reject(new Error("CSV must have at least a header row and one data row."));
          return;
        }

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map((line, idx) => {
          const values = parseCSVLine(line);
          const obj = { __id: idx };
          headers.forEach((h, i) => {
            obj[h] = values[i] ?? "";
          });
          return obj;
        });

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Build a CSV string from rows (array of objects), given headers.
 * Adds __status and __comment columns.
 */
export function buildCSV(headers, rows, decisions) {
  const allHeaders = [...headers, "__status", "__comment"];
  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [allHeaders.map(escape).join(",")];
  for (const row of rows) {
    const d = decisions[row.__id] ?? {};
    const values = headers.map((h) => escape(row[h]));
    values.push(escape(d.status ?? ""));
    values.push(escape(d.comment ?? ""));
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

/**
 * Filter rows by status and download as CSV
 */
export function downloadCSV(headers, rows, decisions, statusFilter, filename) {
  let filteredRows = rows;
  if (statusFilter) {
    filteredRows = rows.filter(
      (r) => (decisions[r.__id]?.status ?? "") === statusFilter
    );
  }
  const csv = buildCSV(headers, filteredRows, decisions);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * localStorage helpers
 */
const STORAGE_KEY = "csv-reviewer-decisions";
const SESSION_KEY = "csv-reviewer-session";
const CSV_META_KEY = "csv-reviewer-meta";

export function loadDecisions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveDecisions(decisions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
}

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveMeta(meta) {
  localStorage.setItem(CSV_META_KEY, JSON.stringify(meta));
}

export function loadMeta() {
  try {
    return JSON.parse(localStorage.getItem(CSV_META_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CSV_META_KEY);
}
