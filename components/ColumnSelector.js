"use client";

export default function ColumnSelector({ headers, rows, filename, onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
          >
            Step 2 of 2
          </p>
          <h2
            className="text-4xl font-light tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#28251e" }}
          >
            Choose your key column
          </h2>
          <p className="text-sm" style={{ color: "#96907a" }}>
            This column will be used as the entry title in the review view.
            &nbsp;
            <span style={{ fontFamily: "var(--font-mono)", color: "#b8b3a0" }}>
              {filename}
            </span>
            &nbsp;&mdash;&nbsp;
            <span style={{ fontFamily: "var(--font-mono)", color: "#b8b3a0" }}>
              {rows.length} rows
            </span>
          </p>
        </div>

        <div className="paper rounded-sm p-2 space-y-1">
          {headers.map((h, idx) => (
            <button
              key={h}
              onClick={() => onSelect(h)}
              className="btn w-full text-left px-5 py-4 rounded-sm flex items-center gap-4 group"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f4f0")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span
                className="text-xs w-6 text-right shrink-0"
                style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
              >
                {idx + 1}
              </span>
              <span
                className="text-base font-light flex-1"
                style={{ color: "#28251e", fontFamily: "var(--font-display)" }}
              >
                {h}
              </span>
              {/* sample value */}
              <span
                className="text-xs truncate max-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
              >
                e.g. {rows[0]?.[h] ?? "—"}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c84b31"
                strokeWidth="2"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
