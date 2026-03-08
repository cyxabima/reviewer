"use client";
import { useState, useRef } from "react";
import { parseCSV } from "@/lib/csv";

export default function UploadScreen({ onLoaded }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { headers, rows } = await parseCSV(file);
      onLoaded({ headers, rows, filename: file.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Wordmark */}
        <div className="mb-12 flex items-center gap-3">
          <div className="w-3 h-10 rounded-sm" style={{ backgroundColor: "#c84b31" }} />
          <h1
            className="text-5xl font-light tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "#28251e" }}
          >
            CSV Reviewer
          </h1>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="rounded-sm cursor-pointer transition-all duration-200 p-16 text-center"
          style={{
            border: `2px dashed ${dragging ? "#c84b31" : "#d4d0c4"}`,
            backgroundColor: dragging ? "rgba(200,75,49,0.04)" : "#faf9f5",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {loading ? (
            <div className="space-y-3">
              <div
                className="mx-auto w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#c84b31", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}>
                Parsing...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="mx-auto w-16 h-16 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: "#eae8e0" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a7462" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <p
                  className="text-lg font-light mb-1"
                  style={{ color: "#3c382e", fontFamily: "var(--font-display)" }}
                >
                  Drop your CSV here
                </p>
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "#96907a", fontFamily: "var(--font-mono)" }}
                >
                  or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p
            className="mt-4 text-sm px-4 py-3 rounded-sm"
            style={{
              color: "#9b2226",
              backgroundColor: "rgba(155,34,38,0.08)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {error}
          </p>
        )}

        <p
          className="mt-6 text-xs text-center"
          style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
        >
          First row is treated as column headers. All processing happens in your browser.
        </p>
      </div>
    </div>
  );
}
