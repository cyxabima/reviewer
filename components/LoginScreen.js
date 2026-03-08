"use client";
import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        onLogin();
      } else if (res.status === 500) {
        setError(data.error || "Server configuration error.");
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f4f0" }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="inline-block w-12 h-12 mb-6 rounded-sm"
            style={{ backgroundColor: "#c84b31" }}
          />
          <h1
            className="text-4xl font-light tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#28251e" }}
          >
            CSV Reviewer
          </h1>
          <p className="text-sm" style={{ color: "#96907a" }}>
            Enter your access password to continue
          </p>
        </div>

        {/* Form */}
        <div className="paper rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "#7a7462", fontFamily: "var(--font-mono)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="..."
                required
                autoFocus
                className="w-full px-4 py-3 rounded-sm text-base outline-none transition-all duration-150"
                style={{
                  backgroundColor: "#eae8e0",
                  border: "1.5px solid transparent",
                  color: "#28251e",
                  fontFamily: "var(--font-display)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c84b31")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>

            {error && (
              <p
                className="text-sm px-3 py-2 rounded-sm"
                style={{
                  color: "#9b2226",
                  backgroundColor: "rgba(155,34,38,0.08)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn w-full py-3 rounded-sm text-sm font-medium uppercase tracking-widest disabled:opacity-40"
              style={{
                backgroundColor: "#28251e",
                color: "#f5f4f0",
                fontFamily: "var(--font-mono)",
              }}
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "#b8b3a0", fontFamily: "var(--font-mono)" }}
        >
          Set APP_PASSWORD in .env.local
        </p>
      </div>
    </div>
  );
}
