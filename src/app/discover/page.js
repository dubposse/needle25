"use client";

import { useState } from "react";
import { GENRES } from "@/lib/genres";

export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = "https://needle25.vercel.app/";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Needle25 - Track your vinyl & music collection",
          text: "", //  das soll jetzt anzuklicken sein 
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSelectGenre(genre) {
    setSelectedGenre(genre);
    setMessage("");
    setIsLoading(true);

    const res = await fetch(`/api/discover/genres/${genre}`);
    const data = await res.json();

    if (!res.ok) {
      setUsers([]);
      setMessage(data.error || "Could not load users");
      setIsLoading(false);
      return;
    }

    setUsers(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }

  return (
    <main
      style={{
        background: "#0b0b0b",
        minHeight: "100vh",
        color: "#fff",
        padding: 30,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>Discover</h1>

        <div style={{ marginBottom: 20 }}>
          <select
            value={selectedGenre}
            onChange={(e) => handleSelectGenre(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
            }}
          >
            <option value="">Select a genre</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? <p style={{ color: "#888" }}>Loading...</p> : null}

        {message ? <p style={{ color: "#888" }}>{message}</p> : null}

        {!isLoading && selectedGenre && users.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <p style={{ color: "#666", marginBottom: 12 }}>No users found.</p>
            <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8, maxWidth: 480 }}>
              Needle25 is just getting started - the first listeners are still finding their way here.
              Want to help build the community? Share this link with fellow music lovers and let them create their personal charts:
            </p>
            <p style={{ marginTop: 12 }}>
              <button
                onClick={handleShare}
                style={{
                  background: "none",
                  border: "1px solid #2a4a3a",
                  borderRadius: 5,
                  color: copied ? "#6bcb77" : "#4caf85",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "3px 10px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {copied ? "Copied ✓" : "Share with friends"}
              </button>
            </p>
            <div style={{ marginTop: 18 }}>
              <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8, maxWidth: 480, marginBottom: 8 }}>
                Or check out the public charts of our demo account:
              </p>
              <a
                href="/charts/testuser"
                style={{
                  display: "inline-block",
                  background: "#222",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #333",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                View demo charts
              </a>
            </div>
          </div>
        ) : null}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((user) => (
            <li
              key={user.username}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #222",
              }}
            >
              <a
                href={`/charts/${user.username}`}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 16,
                }}
              >
                {user.username}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}