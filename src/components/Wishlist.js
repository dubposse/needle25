/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { ALLOWED_FORMATS, FORMAT_LABELS } from "@/lib/formats";

export default function Wishlist({ user, setMessage }) {
  const [wishlist, setWishlist] = useState([]);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  async function loadWishlist() {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setWishlist(res.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
      setEditingItem(null);
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newItem = {
      artist: artist.trim(),
      title: title.trim(),
      format: format.trim(),
    };

    if (!newItem.artist || !newItem.title || !newItem.format) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not add wishlist item");
      return;
    }

    setArtist("");
    setTitle("");
    setFormat("");
    setMessage("Wishlist item added");
    setShowAdd(false);
    loadWishlist();
  }

  async function deleteItem(id) {
    setMessage("");

    const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete wishlist item");
      return;
    }

    setEditingItem(null);
    setMessage("Wishlist item deleted");
    loadWishlist();
  }

  async function saveEdit() {
    setMessage("");

    if (
      !editingItem.artist.trim() ||
      !editingItem.title.trim() ||
      !editingItem.format.trim()
    ) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch(`/api/wishlist/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist: editingItem.artist.trim(),
        title: editingItem.title.trim(),
        format: editingItem.format.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update wishlist item");
      return;
    }

    setEditingItem(null);
    setMessage("Wishlist item updated");
    loadWishlist();
  }

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div style={{ flexShrink: 0 }}>
        <h2>My Wishlist</h2>
        <button onClick={() => setShowAdd(true)} style={{ marginBottom: 20 }}>
          + Add Wishlist Item
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {wishlist.length === 0 ? (
          <p>No wishlist items yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {wishlist.map((item) => (
              <li
                key={item.id}
                onClick={() =>
                  setEditingItem({
                    id: item.id,
                    artist: item.artist,
                    title: item.title,
                    format: item.format,
                  })
                }
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>{item.artist}</div>
                <div style={{ marginTop: 2, fontSize: 14, color: "#aaa" }}>
                  {item.title} · {item.format}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Wishlist Item" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">Select format…</option>
                {ALLOWED_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Add Wishlist Item</button>
          </form>
        </Modal>
      )}

      {editingItem && (
        <Modal title="Edit wishlist item" onClose={() => setEditingItem(null)}>
          <div style={{ marginBottom: 10 }}>
            <input
              value={editingItem.artist}
              onChange={(e) =>
                setEditingItem({ ...editingItem, artist: e.target.value })
              }
              placeholder="Artist"
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              value={editingItem.title}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
              placeholder="Title"
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <select
              value={editingItem.format}
              onChange={(e) =>
                setEditingItem({ ...editingItem, format: e.target.value })
              }
              style={{ width: "100%", padding: 8 }}
            >
              <option value="">Select format…</option>
              {ALLOWED_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit}>Save</button>
            <button onClick={() => deleteItem(editingItem.id)}>Delete</button>
            <button onClick={() => setEditingItem(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
