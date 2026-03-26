/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

const CATEGORY_LABELS = {
  alltime: "All-time favorites",
  current: "Current favorites",
  recommendation: "Recommendations",
};

export default function Charts({ user, setMessage }) {
  const [charts, setCharts] = useState([]);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("alltime");
  const [comment, setComment] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  async function loadCharts() {
    const res = await fetch("/api/charts");
    const data = await res.json();
    setCharts(res.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (user) {
      loadCharts();
    } else {
      setCharts([]);
      setEditingItem(null);
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newItem = {
      artist: artist.trim(),
      title: title.trim(),
      category,
      comment: comment.trim(),
    };

    if (!newItem.artist || !newItem.title || !newItem.category) {
      setMessage("Artist, title and category are required");
      return;
    }

    if (/https?:\/\/|ftp:\/\/|www\./i.test(newItem.comment)) {
      setMessage("Links are not allowed in the comment");
      return;
    }

    const res = await fetch("/api/charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not create chart entry");
      return;
    }

    setArtist("");
    setTitle("");
    setCategory("alltime");
    setComment("");
    setMessage("Chart entry added");
    setShowAdd(false);
    loadCharts();
  }

  async function deleteItem(id) {
    setMessage("");

    const res = await fetch(`/api/charts/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete chart entry");
      return;
    }

    setEditingItem(null);
    setMessage("Chart entry deleted");
    loadCharts();
  }

  async function saveEdit() {
    setMessage("");

    if (
      !editingItem.artist.trim() ||
      !editingItem.title.trim() ||
      !editingItem.category
    ) {
      setMessage("Artist, title and category are required");
      return;
    }

    if (/https?:\/\/|ftp:\/\/|www\./i.test(editingItem.comment?.trim())) {
      setMessage("Links are not allowed in the comment");
      return;
    }

    const res = await fetch(`/api/charts/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist: editingItem.artist.trim(),
        title: editingItem.title.trim(),
        category: editingItem.category,
        comment: editingItem.comment.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update chart entry");
      return;
    }

    setEditingItem(null);
    setMessage("Chart entry updated");
    loadCharts();
  }

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div style={{ flexShrink: 0 }}>
        <h2>My Charts</h2>
        <button onClick={() => setShowAdd(true)} style={{ marginBottom: 20 }}>
          + Add Chart Entry
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {charts.length === 0 ? (
          <p>No chart entries yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {charts.map((item) => (
              <li
                key={item.id}
                onClick={() =>
                  setEditingItem({
                    id: item.id,
                    artist: item.artist,
                    title: item.title,
                    category: item.category || "alltime",
                    comment: item.comment || "",
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
                  {item.title}
                </div>
                <div style={{ marginTop: 2, fontSize: 13, color: "#777" }}>
                  {CATEGORY_LABELS[item.category] || item.category}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Chart Entry" onClose={() => setShowAdd(false)}>
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
            <div style={{ marginBottom: 10 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="alltime">All-time favorites</option>
                <option value="current">Current favorites</option>
                <option value="recommendation">Recommendations</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment (optional)"
                rows={4}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <button type="submit">Add Chart Entry</button>
          </form>
        </Modal>
      )}

      {editingItem && (
        <Modal title="Edit chart entry" onClose={() => setEditingItem(null)}>
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
          <div style={{ marginBottom: 10 }}>
            <select
              value={editingItem.category}
              onChange={(e) =>
                setEditingItem({ ...editingItem, category: e.target.value })
              }
              style={{ width: "100%", padding: 8 }}
            >
              <option value="alltime">All-time favorites</option>
              <option value="current">Current favorites</option>
              <option value="recommendation">Recommendations</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={editingItem.comment}
              onChange={(e) =>
                setEditingItem({ ...editingItem, comment: e.target.value })
              }
              placeholder="Comment"
              rows={4}
              style={{ width: "100%", padding: 8 }}
            />
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
