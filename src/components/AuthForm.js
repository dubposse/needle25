/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

import { useState } from "react";
import { GENRES } from "@/lib/genres";

export default function AuthForm({ onLoginSuccess, setMessage }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [favoriteGenre1, setFavoriteGenre1] = useState("");
  const [favoriteGenre2, setFavoriteGenre2] = useState("");
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [showContactEmail, setShowContactEmail] = useState(false);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setMessage("");

    const endpoint =
      authMode === "register" ? "/api/auth/register" : "/api/auth/login";

    const payload =
      authMode === "register"
        ? {
            email: email.trim(),
            username: username.trim(),
            password: password.trim(),
            favoriteGenre1,
            favoriteGenre2,
          }
        : {
            email: email.trim(),
            password: password.trim(),
          };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    if (authMode === "register") {
      setMessage("Registration successful. Please log in.");
      setAuthMode("login");
      setUsername("");
      setPassword("");
      setFavoriteGenre1("");
      setFavoriteGenre2("");
      return;
    }

    setMessage("Login successful");
    setEmail("");
    setUsername("");
    setPassword("");
    setFavoriteGenre1("");
    setFavoriteGenre2("");
    onLoginSuccess();
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            border: "1px solid #232323",
            borderRadius: 12,
            background: "rgba(24,24,24,0.98)",
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.13)",
            padding: "22px 24px 16px 24px",
            margin: "0 0 20px 0",
            maxWidth: 420,
            color: "#bbb",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.3, margin: 0, marginBottom: 8, letterSpacing: "-0.5px" }}>
            Your vinyl & music collection, organized.
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "#b5b5b5" }}>
            Made for collectors –<br />track your records and showcase your curated charts.
          </div>
        </div>
       
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        {authMode === "register" ? "Register" : "Login"}
      </h2>

      {authMode === "login" && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: showDemoInfo ? 8 : 0,
            }}
          >
            <span style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}>
              Demo Access
            </span>
            <button
              onClick={() => setShowDemoInfo((v) => !v)}
              title="Demo-Zugangsdaten anzeigen"
              aria-label="Demo-Zugangsdaten anzeigen"
              style={{
                background: "none",
                border: "1px solid #444",
                color: "#888",
                borderRadius: "50%",
                width: 18,
                height: 18,
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
                alignSelf: "flex-start",
                marginTop: 2,
              }}
            >
              i
            </button>
          </div>
          {showDemoInfo && (
            <div
              style={{
                fontSize: 13,
                color: "#ddd",
                lineHeight: 1.7,
                padding: "10px 12px",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                maxWidth: 320,
                background: "#181818",
                marginTop: 6,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Public demo account:</strong><br />
                <strong style={{ color: "#fff" }}>Email:</strong> test@needle25<br />
                <strong style={{ color: "#fff" }}>Password:</strong> secret123
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>
            
                Data resets regularly.<br />
                <span style={{ color: "#fff" }}>Register a free account to save your collection and progress.</span>
              </div>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleAuthSubmit}
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 320,
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />

        {authMode === "register" ? (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        ) : null}

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />

        {authMode === "register" ? (
          <>
            <select
              value={favoriteGenre1}
              onChange={(e) => setFavoriteGenre1(e.target.value)}
            >
              <option value="">Favorite genre 1</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={favoriteGenre2}
              onChange={(e) => setFavoriteGenre2(e.target.value)}
            >
              <option value="">Favorite genre 2</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </>
        ) : null}

        <button
          type="submit"
          style={{
            marginTop: 4,
            padding: "10px 0",
            background: "#e8e8e8",
            color: "#0c0c0c",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {authMode === "register" ? "Register" : "Login"}
        </button>
      </form>

      <button
        onClick={() =>
          setAuthMode(authMode === "login" ? "register" : "login")
        }
        style={{
          background: "none",
          border: "none",
          color: "#555",
          fontSize: 13,
          padding: 0,
        }}
      >
        Switch to {authMode === "login" ? "Register" : "Login"}
      </button>

      <p
        style={{
          marginTop: 24,
          fontSize: 13,
          color: "#444",
          lineHeight: 1.7,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Support
        <button
          onClick={() => setShowContactEmail((v) => !v)}
          title="Show contact"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Contact"
            style={{
              height: 13,
              width: "auto",
              opacity: 0.5,
              verticalAlign: "middle",
              margin: "0 1px",
            }}
          />
        </button>
        {showContactEmail ? (
          <span style={{ color: "#666", fontSize: 12 }}>
            matthiasbrehm1@gmx.de
          </span>
        ) : null}
      </p>
    </div>
  );
}
