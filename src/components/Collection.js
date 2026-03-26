/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { ALLOWED_FORMATS, FORMAT_LABELS } from "@/lib/formats";

const FORMAT_OPTIONS = ["", ...ALLOWED_FORMATS];
const FORMAT_LABELS_ALL = { "": "All", ...FORMAT_LABELS };
const SORT_OPTIONS = ["newest", "oldest", "artist_asc"];
const SORT_LABELS = { newest: "New ↓", oldest: "Old ↑", artist_asc: "A–Z" };

export default function Collection({ user, setMessage }) {
  const [collection, setCollection] = useState([]);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [artistFilter, setArtistFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showArtistSearch, setShowArtistSearch] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const formatMenuRef = useRef(null);

  useEffect(() => {
    if (!showFormatMenu) return;
    function handleClickOutside(e) {
      if (formatMenuRef.current && !formatMenuRef.current.contains(e.target)) {
        setShowFormatMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFormatMenu]);

  async function loadCollection() {
    const params = new URLSearchParams();
    if (artistFilter.trim()) params.set("artist", artistFilter.trim());
    if (formatFilter) params.set("format", formatFilter);
    if (sortBy) params.set("sort", sortBy);

    const res = await fetch(`/api/collection?${params.toString()}`);
    const data = await res.json();
    setCollection(res.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (user) {
      loadCollection();
    } else {
      setCollection([]);
      setEditingItem(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadCollection();
  }, [artistFilter, formatFilter, sortBy]);

  function cycleFormat() {
    const i = FORMAT_OPTIONS.indexOf(formatFilter);
    setFormatFilter(FORMAT_OPTIONS[(i + 1) % FORMAT_OPTIONS.length]);
  }

  function cycleSort() {
    const i = SORT_OPTIONS.indexOf(sortBy);
    setSortBy(SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newRelease = {
      artist: artist.trim(),
      title: title.trim(),
      format: format.trim(),
    };

    if (!newRelease.artist || !newRelease.title || !newRelease.format) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRelease),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not add release");
      return;
    }

    setArtist("");
    setTitle("");
    setFormat("");
    setMessage("Release added");
    setShowAdd(false);
    loadCollection();
  }

  async function deleteRelease(id) {
    setMessage("");

    const res = await fetch(`/api/collection/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete release");
      return;
    }

    setEditingItem(null);
    setMessage("Release deleted");
    loadCollection();
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

    const res = await fetch(`/api/collection/${editingItem.id}`, {
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
      setMessage(data.error || "Could not update release");
      return;
    }

    setEditingItem(null);
    setMessage("Release updated");
    loadCollection();
  }

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div style={{ flexShrink: 0 }}>
        <h2>My Collection</h2>

        <button onClick={() => setShowAdd(true)} style={{ marginBottom: 20 }}>
          + Add Release
        </button>

        <div
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }} ref={formatMenuRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <button
                onClick={cycleFormat}
                style={{
                  background: "none",
                  border: "none",
                  color: formatFilter ? "#ccc" : "#888",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 13,
                  textAlign: "left",
                  minWidth: 36,
                }}
              >
                {FORMAT_LABELS_ALL[formatFilter]}
              </button>
              <button
                onClick={() => setShowFormatMenu((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                  opacity: showFormatMenu ? 1 : 0.4,
                }}
              >
                <img src="/logo.png" alt="Needle25" style={{ height: 12, width: "auto" }} />
              </button>
            </div>
            {showFormatMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 100,
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f || "all"}
                    onClick={() => {
                      setFormatFilter(f);
                      setShowFormatMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      background: formatFilter === f ? "#1e1e1e" : "none",
                      border: "none",
                      color: formatFilter === f ? "#ccc" : "#888",
                      cursor: "pointer",
                      padding: "6px 12px",
                      fontSize: 13,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {FORMAT_LABELS_ALL[f]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={cycleSort}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
              flexShrink: 0,
              width: 52,
              textAlign: "left",
            }}
          >
            {SORT_LABELS[sortBy]}
          </button>

          <div
            style={{
              width: 200,
              flexShrink: 0,
              position: "relative",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                placeholder="Search by artist"
                style={{ width: "100%", paddingRight: 28, boxSizing: "border-box" }}
              />
              {artistFilter && (
                <button
                  onClick={() => setArtistFilter("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#666",
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowArtistSearch(true)}
              title="Open as modal"
              style={{
                background: "none",
                border: "1px solid #444",
                borderRadius: 5,
                color: "#aaa",
                cursor: "pointer",
                padding: "2px 5px",
                fontSize: 14,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ⤢
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {collection.length === 0 ? (
          <p>No releases yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {collection.map((item) => (
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

      {showArtistSearch && (
        <Modal
          title="Search by artist"
          onClose={() => setShowArtistSearch(false)}
          maxWidth={320}
        >
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              placeholder="Search by artist..."
              style={{
                width: "100%",
                paddingRight: artistFilter ? 28 : undefined,
                boxSizing: "border-box",
              }}
            />
            {artistFilter && (
              <button
                onClick={() => setArtistFilter("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#666",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowArtistSearch(false)}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
            }}
          >
            Done
          </button>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Add Release" onClose={() => setShowAdd(false)}>
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
            <button type="submit">Add Release</button>
          </form>
        </Modal>
      )}

      {editingItem && (
        <Modal title="Edit collection item" onClose={() => setEditingItem(null)}>
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
            <button onClick={() => deleteRelease(editingItem.id)}>Delete</button>
            <button onClick={() => setEditingItem(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
