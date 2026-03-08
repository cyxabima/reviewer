"use client";
import { useState, useEffect } from "react";
import LoginScreen from "./LoginScreen";
import UploadScreen from "./UploadScreen";
import ColumnSelector from "./ColumnSelector";
import ReviewScreen from "./ReviewScreen";
import {
  loadDecisions,
  saveDecisions,
  loadSession,
  saveSession,
  clearSession,
  saveMeta,
  loadMeta,
  clearAll,
} from "@/lib/csv";

export default function App() {
  const [auth, setAuth] = useState(false);
  const [screen, setScreen] = useState("upload");
  const [csvData, setCsvData] = useState(null);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [decisions, setDecisions] = useState({});

  // Restore session on mount
  useEffect(() => {
    const wasAuthed = sessionStorage.getItem("csv-reviewer-authed") === "true";
    if (wasAuthed) setAuth(true);

    const session = loadSession();
    const meta = loadMeta();

    if (session && meta?.primaryKey) {
      setCsvData(session);
      setPrimaryKey(meta.primaryKey);
      setDecisions(loadDecisions());
      setScreen("review");
    }
  }, []);

  function handleLogin() {
    sessionStorage.setItem("csv-reviewer-authed", "true");
    setAuth(true);
  }

  function handleLoaded(data) {
    clearAll();
    setCsvData(data);
    saveSession(data);
    setPrimaryKey(null);
    setScreen("select");
  }

  function handleColumnSelect(col) {
    // Set everything synchronously before switching screen
    // so the review condition is met on the very next render
    saveMeta({ primaryKey: col });
    const saved = loadDecisions();
    setPrimaryKey(col);
    setDecisions(saved);
    setScreen("review");
  }

  function handleReset() {
    clearSession();
    clearAll();
    setCsvData(null);
    setPrimaryKey(null);
    setDecisions({});
    setScreen("upload");
  }

  if (!auth) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === "upload") {
    return <UploadScreen onLoaded={handleLoaded} />;
  }

  if (screen === "select" && csvData) {
    return (
      <ColumnSelector
        headers={csvData.headers}
        rows={csvData.rows}
        filename={csvData.filename}
        onSelect={handleColumnSelect}
      />
    );
  }

  if (screen === "review" && csvData && primaryKey) {
    return (
      <ReviewScreen
        headers={csvData.headers}
        rows={csvData.rows}
        filename={csvData.filename}
        primaryKey={primaryKey}
        decisions={decisions}
        setDecisions={setDecisions}
        onReset={handleReset}
      />
    );
  }

  // Should never reach here, but guard anyway
  return <UploadScreen onLoaded={handleLoaded} />;
}
