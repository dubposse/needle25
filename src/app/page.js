"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingArtist, setEditingArtist] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingFormat, setEditingFormat] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [message, setMessage] = useState("");

  async function loadCurrentUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (!res.ok || !data.user) {
      setUser(null);
      return null;
    }

    setUser(data.user);
    return data.user;
  }

  async function loadCollection() {
    const res = await fetch("/api/collection");
    const data = await res.json();

    if (!res.ok) {
      setCollection([]);
      return;
    }

    setCollection(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function init() {
      setIsLoadingAuth(true);

      const currentUser = await loadCurrentUser();

      if (currentUser) {
        await loadCollection();
      } else {
        setCollection([]);
      }

      setIsLoadingAuth(false);
    }

    init();
  }, []);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setMessage("");

    const endpoint =
      authMode === "register" ? "/api/auth/register" : "/api/auth/login";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    if (authMode === "register") {
      setMessage("Registration successful. Please log in.");
      setAuthMode("login");
      setPassword("");
      return;
    }

    setMessage("Login successful");
    setEmail("");
    setPassword("");

    setIsLoadingAuth(true);
    await loadCurrentUser();
    await loadCollection();
    setIsLoadingAuth(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    setCollection([]);
    setMessage("Logged out");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newRelease = {
      artist: artist.trim(),
      title: title.trim(),
      format: format.trim(),
    };

    if (!newRelease.artist || !newRelease.title || !newRelease.format) {
      return;
    }

    await fetch("/api/collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRelease),
    });

    setArtist("");
    setTitle("");
    setFormat("");
    loadCollection();
  }

  async function deleteRelease(id) {
    await fetch(`/api/collection/${id}`, {
      method: "DELETE",
    });

    loadCollection();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingArtist(item.artist);
    setEditingTitle(item.title);
    setEditingFormat(item.format);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingArtist("");
    setEditingTitle("");
    setEditingFormat("");
  }

  async function saveEdit(id) {
    const updatedRelease = {
      artist: editingArtist.trim(),
      title: editingTitle.trim(),
      format: editingFormat.trim(),
    };

    if (
      !updatedRelease.artist ||
      !updatedRelease.title ||
      !updatedRelease.format
    ) {
      return;
    }

    await fetch(`/api/collection/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRelease),
    });

    cancelEdit();
    loadCollection();
  }

  if (isLoadingAuth) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Needle25</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 700 }}>
      <h1>Needle25</h1>

      {!user ? (
        <>
          <h2>{authMode === "register" ? "Register" : "Login"}</h2>

          <form onSubmit={handleAuthSubmit} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
            </div>

            <button type="submit">
              {authMode === "register" ? "Register" : "Login"}
            </button>
          </form>

          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
          >
            Switch to {authMode === "login" ? "Register" : "Login"}
          </button>
        </>
      ) : (
        <>
          <p>
            Logged in as <strong>{user.email}</strong>
          </p>

          <button onClick={handleLogout} style={{ marginBottom: 20 }}>
            Logout
          </button>

          <h2>My Collection</h2>

          <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Format (vinyl, cd, tape...)"
              />
            </div>

            <button type="submit">Add Release</button>
          </form>

          {collection.length === 0 ? (
            <p>No releases yet.</p>
          ) : (
            <ul>
              {collection.map((item) => (
                <li key={item.id} style={{ marginBottom: 12 }}>
                  {editingId === item.id ? (
                    <div>
                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingArtist}
                          onChange={(e) => setEditingArtist(e.target.value)}
                          placeholder="Artist"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          placeholder="Title"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingFormat}
                          onChange={(e) => setEditingFormat(e.target.value)}
                          placeholder="Format"
                        />
                      </div>

                      <button onClick={() => saveEdit(item.id)}>💾 Save</button>
                      <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <strong>{item.artist}</strong> – {item.title} (
                      {item.format}){" "}
                      <button onClick={() => startEdit(item)}>✏️</button>
                      <button onClick={() => deleteRelease(item.id)}>❌</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {message ? <p style={{ marginTop: 20 }}>{message}</p> : null}
    </main>
  );
}