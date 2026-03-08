"use client";
import { useState, useEffect } from "react";
import { saveDecisions, downloadCSV } from "@/lib/csv";

const STATUS_CONFIG = {
  done:  { label: "Done",  color: "#2d6a4f", bg: "rgba(45,106,79,0.10)"  },
  maybe: { label: "Maybe", color: "#b5700a", bg: "rgba(181,112,10,0.10)" },
  no:    { label: "No",    color: "#9b2226", bg: "rgba(155,34,38,0.10)"  },
};

export default function ReviewScreen({
  headers,
  rows,
  filename,
  primaryKey,
  decisions,
  setDecisions,
  onReset,
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null); // null = all
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState("");

  const filteredRows = filterStatus
    ? rows.filter((r) => (decisions[r.__id]?.status ?? "") === filterStatus)
    : rows;

  const total = filteredRows.length;
  const row = filteredRows[currentIdx];
  const decision = row ? (decisions[row.__id] ?? {}) : {};
  const progress = rows.filter((r) => decisions[r.__id]?.status).length;

  // Sync comment draft when row changes
  useEffect(() => {
    setCommentDraft(decision.comment ?? "");
    setCommentOpen(false);
  }, [currentIdx, filterStatus]);

  function updateDecision(rowId, patch) {
    const next = { ...decisions, [rowId]: { ...(decisions[rowId] ?? {}), ...patch } };
    setDecisions(next);
    saveDecisions(next);
  }

  function setStatus(status) {
    if (!row) return;
    updateDecision(row.__id, { status });
    // auto advance if not last
    if (currentIdx < total - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 280);
    }
  }

  function saveComment() {
    if (!row) return;
    updateDecision(row.__id, { comment: commentDraft });
    setCommentOpen(false);
  }

  function go(dir) {
    setCurrentIdx((i) => Math.max(0, Math.min(total - 1, i + dir)));
  }

  function handleKeyDown(e) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight" || e.key === "j") go(1);
    if (e.key === "ArrowLeft" || e.key === "k") go(-1);
    if (e.key === "1") setStatus("done");
    if (e.key === "2") setStatus("maybe");
    if (e.key === "3") setStatus("no");
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const counts = {
    done:  rows.filter((r) => decisions[r.__id]?.status === "done").length,
    maybe: rows.filter((r) => decisions[r.__id]?.status === "maybe").length,
    no:    rows.filter((r) => decisions[r.__id]?.status === "no").length,
  };

  const otherHeaders = headers.filter((h) => h !== primaryKey);

  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}>
            No entries match this filter.
          </p>
          <button
            onClick={() => { setFilterStatus(null); setCurrentIdx(0); }}
            className="btn mt-4 px-4 py-2 rounded-sm text-xs uppercase tracking-widest"
            style={{ backgroundColor: "#28251e", color: "#f5f4f0", fontFamily: "var(--font-mono)" }}
          >
            Clear filter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f4f0" }}
    >
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{
          backgroundColor: "rgba(245,244,240,0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "#d4d0c4",
        }}
      >
        {/* Left: logo + file name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-6 rounded-sm shrink-0" style={{ backgroundColor: "#c84b31" }} />
          <span
            className="text-sm font-light truncate"
            style={{ color: "#3c382e", fontFamily: "var(--font-display)" }}
          >
            {filename}
          </span>
        </div>

        {/* Center: progress */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs"
            style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
          >
            {progress} / {rows.length} reviewed
          </span>
          <div className="w-24 h-1 rounded-full" style={{ backgroundColor: "#d4d0c4" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(progress / rows.length) * 100}%`,
                backgroundColor: "#c84b31",
              }}
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Download */}
          <div className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              className="btn px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest"
              style={{
                backgroundColor: "#eae8e0",
                color: "#3c382e",
                fontFamily: "var(--font-mono)",
              }}
            >
              Export
            </button>
            {downloadOpen && (
              <div
                className="absolute right-0 mt-1 rounded-sm paper z-30 overflow-hidden"
                style={{ minWidth: "160px" }}
              >
                {[
                  { label: "All entries", filter: null, fname: `all_${filename}` },
                  { label: "Done only",   filter: "done",  fname: `done_${filename}` },
                  { label: "Maybe only",  filter: "maybe", fname: `maybe_${filename}` },
                  { label: "No only",     filter: "no",    fname: `no_${filename}` },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      downloadCSV(headers, rows, decisions, opt.filter, opt.fname);
                      setDownloadOpen(false);
                    }}
                    className="btn w-full text-left px-4 py-3 text-xs"
                    style={{
                      color: "#3c382e",
                      fontFamily: "var(--font-mono)",
                      borderBottom: "1px solid #eae8e0",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f4f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm("Clear all decisions and comments for this file?")) {
                setDecisions({});
                saveDecisions({});
              }
            }}
            className="btn px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(155,34,38,0.10)",
              color: "#9b2226",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(155,34,38,0.20)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(155,34,38,0.10)"; }}
          >
            Reset
          </button>

          <button
            onClick={onReset}
            className="btn px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest"
            style={{
              backgroundColor: "#28251e",
              color: "#f5f4f0",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3c382e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#28251e"; }}
          >
            New file
          </button>
        </div>
      </header>

      {/* ── Status filter tabs ── */}
      <div
        className="flex items-center gap-1 px-6 py-2 border-b"
        style={{ borderColor: "#d4d0c4" }}
      >
        <FilterTab
          label="All"
          count={rows.length}
          active={filterStatus === null}
          onClick={() => { setFilterStatus(null); setCurrentIdx(0); }}
          color="#28251e"
        />
        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
          <FilterTab
            key={s}
            label={cfg.label}
            count={counts[s]}
            active={filterStatus === s}
            onClick={() => { setFilterStatus(s); setCurrentIdx(0); }}
            color={cfg.color}
          />
        ))}
      </div>

      {/* ── Main card ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Entry counter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
              >
                Entry
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "#28251e", fontFamily: "var(--font-mono)" }}
              >
                {currentIdx + 1}
              </span>
              <span
                className="text-xs"
                style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
              >
                / {total}
              </span>
            </div>

            {/* Status badge if already set */}
            {decision.status && (
              <span
                className="text-xs px-3 py-1 rounded-full uppercase tracking-widest font-medium"
                style={{
                  color: STATUS_CONFIG[decision.status].color,
                  backgroundColor: STATUS_CONFIG[decision.status].bg,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {STATUS_CONFIG[decision.status].label}
              </span>
            )}
          </div>

          {/* Card */}
          <div className="paper-raised rounded-sm overflow-hidden">
            {/* Primary key header */}
            <div
              className="px-8 py-6 border-b"
              style={{ borderColor: "#eae8e0" }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
              >
                {primaryKey}
              </p>
              <h2
                className="text-3xl font-light leading-snug"
                style={{ fontFamily: "var(--font-display)", color: "#28251e" }}
              >
                {row[primaryKey] || <span style={{ color: "#b8b3a0" }}>(empty)</span>}
              </h2>
            </div>

            {/* Other fields */}
            {otherHeaders.length > 0 && (
              <div className="px-8 py-6 border-b" style={{ borderColor: "#eae8e0" }}>
                <div className="space-y-4">
                  {otherHeaders.map((h) => (
                    <div key={h} className="flex gap-4">
                      <span
                        className="text-xs uppercase tracking-widest pt-0.5 w-36 shrink-0"
                        style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
                      >
                        {h}
                      </span>
                      <span
                        className="text-base font-light leading-relaxed flex-1"
                        style={{
                          color: row[h] ? "#28251e" : "#b8b3a0",
                          fontFamily: "var(--font-display)",
                          wordBreak: "break-word",
                        }}
                      >
                        {row[h] || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment section */}
            <div className="px-8 py-5 border-b" style={{ borderColor: "#eae8e0" }}>
              {commentOpen ? (
                <div className="space-y-3">
                  <label
                    className="block text-xs uppercase tracking-widest"
                    style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
                  >
                    Comment
                  </label>
                  <textarea
                    autoFocus
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    rows={3}
                    placeholder="Add a note before marking..."
                    className="w-full px-4 py-3 rounded-sm text-sm resize-none outline-none"
                    style={{
                      backgroundColor: "#f5f4f0",
                      border: "1.5px solid #c84b31",
                      color: "#28251e",
                      fontFamily: "var(--font-display)",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveComment}
                      className="btn px-4 py-2 rounded-sm text-xs uppercase tracking-widest"
                      style={{
                        backgroundColor: "#28251e",
                        color: "#f5f4f0",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setCommentOpen(false); setCommentDraft(decision.comment ?? ""); }}
                      className="btn px-4 py-2 rounded-sm text-xs uppercase tracking-widest"
                      style={{
                        backgroundColor: "#eae8e0",
                        color: "#7a7462",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCommentOpen(true)}
                  className="btn flex items-start gap-3 w-full text-left group"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#96907a" strokeWidth="1.5" className="mt-0.5 shrink-0">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {decision.comment ? (
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: "#3c382e", fontFamily: "var(--font-display)" }}
                    >
                      {decision.comment}
                    </span>
                  ) : (
                    <span
                      className="text-sm group-hover:text-opacity-80"
                      style={{ color: "#b8b3a0", fontFamily: "var(--font-display)" }}
                    >
                      Add a comment...
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="btn py-4 rounded-sm text-sm font-medium uppercase tracking-widest transition-all duration-150"
                    style={{
                      backgroundColor: decision.status === s ? cfg.color : "#eae8e0",
                      color: decision.status === s ? "#faf9f5" : cfg.color,
                      fontFamily: "var(--font-mono)",
                      border: `1.5px solid ${decision.status === s ? cfg.color : "transparent"}`,
                    }}
                    onMouseEnter={(e) => {
                      if (decision.status !== s) {
                        e.currentTarget.style.backgroundColor = cfg.bg;
                        e.currentTarget.style.borderColor = cfg.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (decision.status !== s) {
                        e.currentTarget.style.backgroundColor = "#eae8e0";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <p
                className="mt-4 text-center text-xs"
                style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
              >
                Keys: 1 done &nbsp;/&nbsp; 2 maybe &nbsp;/&nbsp; 3 no &nbsp;/&nbsp; arrows to navigate
              </p>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              disabled={currentIdx === 0}
              className="btn flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm disabled:opacity-30"
              style={{
                backgroundColor: "#faf9f5",
                color: "#3c382e",
                border: "1px solid #d4d0c4",
                fontFamily: "var(--font-mono)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Prev
            </button>

            {/* Jump to */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseInt(jumpInput, 10);
                if (!isNaN(n) && n >= 1 && n <= total) {
                  setCurrentIdx(n - 1);
                }
                setJumpInput("");
              }}
              className="flex items-center gap-2"
            >
              <input
                type="number"
                min={1}
                max={total}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={String(currentIdx + 1)}
                className="w-16 text-center px-2 py-1.5 rounded-sm text-xs outline-none"
                style={{
                  backgroundColor: "#faf9f5",
                  border: "1px solid #d4d0c4",
                  color: "#28251e",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <span
                className="text-xs"
                style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
              >
                / {total}
              </span>
              <button
                type="submit"
                className="btn text-xs px-3 py-1.5 rounded-sm"
                style={{
                  backgroundColor: "#eae8e0",
                  color: "#3c382e",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Go
              </button>
            </form>

            <button
              onClick={() => go(1)}
              disabled={currentIdx === total - 1}
              className="btn flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm disabled:opacity-30"
              style={{
                backgroundColor: "#faf9f5",
                color: "#3c382e",
                border: "1px solid #d4d0c4",
                fontFamily: "var(--font-mono)",
              }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterTab({ label, count, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="btn flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest transition-all"
      style={{
        backgroundColor: active ? "#28251e" : "transparent",
        color: active ? "#f5f4f0" : color,
        fontFamily: "var(--font-mono)",
      }}
    >
      {label}
      <span
        className="px-1.5 py-0.5 rounded-full text-xs"
        style={{
          backgroundColor: active ? "rgba(255,255,255,0.15)" : "#eae8e0",
          color: active ? "#f5f4f0" : "#7a7462",
        }}
      >
        {count}
      </span>
    </button>
  );
}
