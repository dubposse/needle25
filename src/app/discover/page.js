"use client";

import { useState } from "react";
import { GENRES } from "@/lib/genres";

export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

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
          <p style={{ color: "#666" }}>No users found.</p>
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