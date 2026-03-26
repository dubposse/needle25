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
        <p
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.4,
            margin: "0 0 6px 0",
          }}
        >
          Organize your vinyl &amp; music collection
        </p>
        <p
          style={{
            color: "#888",
            fontSize: 13,
            lineHeight: 1.7,
            margin: "0 0 10px 0",
          }}
        >
          Manage a wishlist and share your personal charts. <br />{" "}
          &nbsp;
          <img
            src="/logo.png"
            alt=""
            style={{
              height: 11,
              width: "auto",
              opacity: 0.4,
              verticalAlign: "middle",
              position: "relative",
              top: "-2px",
            }}
          />
          &nbsp; From current favorites to all-time picks.
        </p>
        <p style={{ color: "#888", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
          All data is private. <br /> Only your curated charts are public by
          default.
        </p>
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
            <p
              style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}
            >
              Demo Access <br />
              Email: {process.env.NEXT_PUBLIC_DEMO_EMAIL || "nicht gesetzt"}
              <br />
              Password: {process.env.NEXT_PUBLIC_DEMO_PASSWORD || "nicht gesetzt"}
            </p>
            <button
              onClick={() => setShowDemoInfo((v) => !v)}
              title="Demo features"
              style={{
                background: "none",
                border: "1px solid #444",
                color: "#888",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10,
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
                fontSize: 11,
                color: "#666",
                lineHeight: 1.7,
                padding: "8px 10px",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                maxWidth: 300,
              }}
            >
              <strong
                style={{ color: "#999", display: "block", marginBottom: 4 }}
              >
                Try all features
              </strong>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                <li>Manage a music collection (vinyl, cd, tape ...)</li>
                <li>Maintain a wishlist</li>
                <li>Create charts</li>
              </ul>
              <p
                style={{
                  margin: "6px 0 0 0",
                  paddingTop: 6,
                  borderTop: "1px solid #2a2a2a",
                }}
              >
                Shared demo account – all data is visible and editable by
                anyone. For your own private collection and saved data,
                register a free account.
              </p>
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
