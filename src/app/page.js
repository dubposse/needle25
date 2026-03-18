"use client";

import { useEffect, useState } from "react";

const CATEGORY_LABELS = {
  alltime: "All-time favorites",
  current: "Current favorites",
  recommendation: "Recommendations",
};

function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#111",
          color: "#fff",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [charts, setCharts] = useState([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");

  const [wishlistArtist, setWishlistArtist] = useState("");
  const [wishlistTitle, setWishlistTitle] = useState("");
  const [wishlistFormat, setWishlistFormat] = useState("");

  const [chartArtist, setChartArtist] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const [chartCategory, setChartCategory] = useState("alltime");
  const [chartComment, setChartComment] = useState("");

  const [editingCollectionItem, setEditingCollectionItem] = useState(null);
  const [editingWishlistItem, setEditingWishlistItem] = useState(null);
  const [editingChartItem, setEditingChartItem] = useState(null);

  const [artistFilter, setArtistFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
    const params = new URLSearchParams();

    if (artistFilter.trim()) {
      params.set("artist", artistFilter.trim());
    }

    if (formatFilter) {
      params.set("format", formatFilter);
    }

    if (sortBy) {
      params.set("sort", sortBy);
    }

    const res = await fetch(`/api/collection?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      setCollection([]);
      return;
    }

    setCollection(Array.isArray(data) ? data : []);
  }

  async function loadWishlist() {
    const res = await fetch("/api/wishlist");
    const data = await res.json();

    if (!res.ok) {
      setWishlist([]);
      return;
    }

    setWishlist(Array.isArray(data) ? data : []);
  }

  async function loadCharts() {
    const res = await fetch("/api/charts");
    const data = await res.json();

    if (!res.ok) {
      setCharts([]);
      return;
    }

    setCharts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function init() {
      setIsLoadingAuth(true);

      const currentUser = await loadCurrentUser();

      if (currentUser) {
        await loadCollection();
        await loadWishlist();
        await loadCharts();
      } else {
        setCollection([]);
        setWishlist([]);
        setCharts([]);
      }

      setIsLoadingAuth(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (user) {
      loadCollection();
    }
  }, [artistFilter, formatFilter, sortBy, user]);

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
          }
        : {
            email: email.trim(),
            password: password.trim(),
          };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      return;
    }

    setMessage("Login successful");
    setEmail("");
    setUsername("");
    setPassword("");

    setIsLoadingAuth(true);
    await loadCurrentUser();
    await loadCollection();
    await loadWishlist();
    await loadCharts();
    setIsLoadingAuth(false);
  }

  async function handleLogout() {
    setMessage("");

    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not log out");
      return;
    }

    setUser(null);
    setCollection([]);
    setWishlist([]);
    setCharts([]);
    setEditingCollectionItem(null);
    setEditingWishlistItem(null);
    setEditingChartItem(null);
    setMessage("Logged out");
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
      headers: {
        "Content-Type": "application/json",
      },
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
    loadCollection();
  }

  async function handleWishlistSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newWishlistItem = {
      artist: wishlistArtist.trim(),
      title: wishlistTitle.trim(),
      format: wishlistFormat.trim(),
    };

    if (
      !newWishlistItem.artist ||
      !newWishlistItem.title ||
      !newWishlistItem.format
    ) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newWishlistItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not add wishlist item");
      return;
    }

    setWishlistArtist("");
    setWishlistTitle("");
    setWishlistFormat("");
    setMessage("Wishlist item added");
    loadWishlist();
  }

  async function handleChartSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newChartItem = {
      artist: chartArtist.trim(),
      title: chartTitle.trim(),
      category: chartCategory,
      comment: chartComment.trim(),
    };

    if (!newChartItem.artist || !newChartItem.title || !newChartItem.category) {
      setMessage("Artist, title and category are required");
      return;
    }

    const res = await fetch("/api/charts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newChartItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not create chart entry");
      return;
    }

    setChartArtist("");
    setChartTitle("");
    setChartCategory("alltime");
    setChartComment("");
    setMessage("Chart entry added");
    loadCharts();
  }

  async function deleteRelease(id) {
    setMessage("");

    const res = await fetch(`/api/collection/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete release");
      return;
    }

    setEditingCollectionItem(null);
    setMessage("Release deleted");
    loadCollection();
  }

  async function deleteWishlistItem(id) {
    setMessage("");

    const res = await fetch(`/api/wishlist/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete wishlist item");
      return;
    }

    setEditingWishlistItem(null);
    setMessage("Wishlist item deleted");
    loadWishlist();
  }

  async function deleteChartItem(id) {
    setMessage("");

    const res = await fetch(`/api/charts/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete chart entry");
      return;
    }

    setEditingChartItem(null);
    setMessage("Chart entry deleted");
    loadCharts();
  }

  function openCollectionModal(item) {
    setEditingCollectionItem({
      id: item.id,
      artist: item.artist,
      title: item.title,
      format: item.format,
    });
  }

  function closeCollectionModal() {
    setEditingCollectionItem(null);
  }

  async function saveCollectionModal() {
    setMessage("");

    if (
      !editingCollectionItem.artist.trim() ||
      !editingCollectionItem.title.trim() ||
      !editingCollectionItem.format.trim()
    ) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch(`/api/collection/${editingCollectionItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist: editingCollectionItem.artist.trim(),
        title: editingCollectionItem.title.trim(),
        format: editingCollectionItem.format.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update release");
      return;
    }

    closeCollectionModal();
    setMessage("Release updated");
    loadCollection();
  }

  function openWishlistModal(item) {
    setEditingWishlistItem({
      id: item.id,
      artist: item.artist,
      title: item.title,
      format: item.format,
    });
  }

  function closeWishlistModal() {
    setEditingWishlistItem(null);
  }

  async function saveWishlistModal() {
    setMessage("");

    if (
      !editingWishlistItem.artist.trim() ||
      !editingWishlistItem.title.trim() ||
      !editingWishlistItem.format.trim()
    ) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch(`/api/wishlist/${editingWishlistItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist: editingWishlistItem.artist.trim(),
        title: editingWishlistItem.title.trim(),
        format: editingWishlistItem.format.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update wishlist item");
      return;
    }

    closeWishlistModal();
    setMessage("Wishlist item updated");
    loadWishlist();
  }

  function openChartModal(item) {
    setEditingChartItem({
      id: item.id,
      artist: item.artist,
      title: item.title,
      category: item.category || "alltime",
      comment: item.comment || "",
    });
  }

  function closeChartModal() {
    setEditingChartItem(null);
  }

  async function saveChartModal() {
    setMessage("");

    if (
      !editingChartItem.artist.trim() ||
      !editingChartItem.title.trim() ||
      !editingChartItem.category
    ) {
      setMessage("Artist, title and category are required");
      return;
    }

    const res = await fetch(`/api/charts/${editingChartItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist: editingChartItem.artist.trim(),
        title: editingChartItem.title.trim(),
        category: editingChartItem.category,
        comment: editingChartItem.comment.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update chart entry");
      return;
    }

    closeChartModal();
    setMessage("Chart entry updated");
    loadCharts();
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
    <main style={{ padding: 20, maxWidth: 800 }}>
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

            {authMode === "register" ? (
              <div style={{ marginBottom: 10 }}>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>
            ) : null}

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

          <p>
            Username: <strong>{user.username}</strong>
          </p>

          <p>
            Public charts link:{" "}
            <a href={`/charts/${user.username}`} target="_blank" rel="noreferrer">
              /charts/{user.username}
            </a>
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

          <div style={{ marginBottom: 20 }}>
            <h3>Filter & Sort</h3>

            <div style={{ marginBottom: 10 }}>
              <input
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                placeholder="Search by artist"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
              >
                <option value="">All formats</option>
                <option value="vinyl">Vinyl</option>
                <option value="cd">CD</option>
                <option value="tape">Tape</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="artist_asc">Artist A-Z</option>
              </select>
            </div>
          </div>

          {collection.length === 0 ? (
            <p>No releases yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {collection.map((item) => (
                <li
                  key={item.id}
                  onClick={() => openCollectionModal(item)}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #222",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{item.artist}</div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 14,
                      color: "#aaa",
                    }}
                  >
                    {item.title} · {item.format}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <hr style={{ margin: "30px 0" }} />

          <h2>My Wishlist</h2>

          <form onSubmit={handleWishlistSubmit} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={wishlistArtist}
                onChange={(e) => setWishlistArtist(e.target.value)}
                placeholder="Artist"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={wishlistTitle}
                onChange={(e) => setWishlistTitle(e.target.value)}
                placeholder="Title"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={wishlistFormat}
                onChange={(e) => setWishlistFormat(e.target.value)}
                placeholder="Format (vinyl, cd, tape...)"
              />
            </div>

            <button type="submit">Add Wishlist Item</button>
          </form>

          {wishlist.length === 0 ? (
            <p>No wishlist items yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {wishlist.map((item) => (
                <li
                  key={item.id}
                  onClick={() => openWishlistModal(item)}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #222",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{item.artist}</div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 14,
                      color: "#aaa",
                    }}
                  >
                    {item.title} · {item.format}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <hr style={{ margin: "30px 0" }} />

          <h2>My Charts</h2>

          <form onSubmit={handleChartSubmit} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={chartArtist}
                onChange={(e) => setChartArtist(e.target.value)}
                placeholder="Artist"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Title"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <select
                value={chartCategory}
                onChange={(e) => setChartCategory(e.target.value)}
              >
                <option value="alltime">All-time favorites</option>
                <option value="current">Current favorites</option>
                <option value="recommendation">Recommendations</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <textarea
                value={chartComment}
                onChange={(e) => setChartComment(e.target.value)}
                placeholder="Comment (optional)"
                rows={4}
                style={{ width: "100%" }}
              />
            </div>

            <button type="submit">Add Chart Entry</button>
          </form>

          {charts.length === 0 ? (
            <p>No chart entries yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {charts.map((item) => (
                <li
                  key={item.id}
                  onClick={() => openChartModal(item)}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #222",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{item.artist}</div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 14,
                      color: "#aaa",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 13,
                      color: "#777",
                    }}
                  >
                    {CATEGORY_LABELS[item.category] || item.category}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {editingCollectionItem ? (
        <Modal title="Edit collection item" onClose={closeCollectionModal}>
          <div style={{ marginBottom: 10 }}>
            <input
              value={editingCollectionItem.artist}
              onChange={(e) =>
                setEditingCollectionItem({
                  ...editingCollectionItem,
                  artist: e.target.value,
                })
              }
              placeholder="Artist"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              value={editingCollectionItem.title}
              onChange={(e) =>
                setEditingCollectionItem({
                  ...editingCollectionItem,
                  title: e.target.value,
                })
              }
              placeholder="Title"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <input
              value={editingCollectionItem.format}
              onChange={(e) =>
                setEditingCollectionItem({
                  ...editingCollectionItem,
                  format: e.target.value,
                })
              }
              placeholder="Format"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveCollectionModal}>Save</button>
            <button onClick={() => deleteRelease(editingCollectionItem.id)}>
              Delete
            </button>
            <button onClick={closeCollectionModal}>Cancel</button>
          </div>
        </Modal>
      ) : null}

      {editingWishlistItem ? (
        <Modal title="Edit wishlist item" onClose={closeWishlistModal}>
          <div style={{ marginBottom: 10 }}>
            <input
              value={editingWishlistItem.artist}
              onChange={(e) =>
                setEditingWishlistItem({
                  ...editingWishlistItem,
                  artist: e.target.value,
                })
              }
              placeholder="Artist"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              value={editingWishlistItem.title}
              onChange={(e) =>
                setEditingWishlistItem({
                  ...editingWishlistItem,
                  title: e.target.value,
                })
              }
              placeholder="Title"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <input
              value={editingWishlistItem.format}
              onChange={(e) =>
                setEditingWishlistItem({
                  ...editingWishlistItem,
                  format: e.target.value,
                })
              }
              placeholder="Format"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveWishlistModal}>Save</button>
            <button onClick={() => deleteWishlistItem(editingWishlistItem.id)}>
              Delete
            </button>
            <button onClick={closeWishlistModal}>Cancel</button>
          </div>
        </Modal>
      ) : null}

      {editingChartItem ? (
        <Modal title="Edit chart entry" onClose={closeChartModal}>
          <div style={{ marginBottom: 10 }}>
            <input
              value={editingChartItem.artist}
              onChange={(e) =>
                setEditingChartItem({
                  ...editingChartItem,
                  artist: e.target.value,
                })
              }
              placeholder="Artist"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              value={editingChartItem.title}
              onChange={(e) =>
                setEditingChartItem({
                  ...editingChartItem,
                  title: e.target.value,
                })
              }
              placeholder="Title"
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <select
              value={editingChartItem.category}
              onChange={(e) =>
                setEditingChartItem({
                  ...editingChartItem,
                  category: e.target.value,
                })
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
              value={editingChartItem.comment}
              onChange={(e) =>
                setEditingChartItem({
                  ...editingChartItem,
                  comment: e.target.value,
                })
              }
              placeholder="Comment"
              rows={4}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveChartModal}>Save</button>
            <button onClick={() => deleteChartItem(editingChartItem.id)}>
              Delete
            </button>
            <button onClick={closeChartModal}>Cancel</button>
          </div>
        </Modal>
      ) : null}

      {message ? <p style={{ marginTop: 20 }}>{message}</p> : null}
    </main>
  );
}