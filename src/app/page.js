"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [collection, setCollection] = useState([]);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingArtist, setEditingArtist] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingFormat, setEditingFormat] = useState("");

  async function loadCollection() {
    const res = await fetch("/api/collection");
    const data = await res.json();
    setCollection(data);
  }

  useEffect(() => {
    loadCollection();
  }, []);

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

  return (
    <main style={{ padding: 20 }}>
      <h1>Needle25</h1>
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
                  <strong>{item.artist}</strong> – {item.title} ({item.format}){" "}
                  <button onClick={() => startEdit(item)}>✏️</button>
                  <button onClick={() => deleteRelease(item.id)}>❌</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}