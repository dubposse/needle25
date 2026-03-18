"use client";

import { useEffect, useState } from "react";

const CATEGORY_LABELS = {
  alltime: "Alltime Favorites",
  current: "Current Favourites",
  recommendation: "Recommendations",
};

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

  const [editingId, setEditingId] = useState(null);
  const [editingArtist, setEditingArtist] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingFormat, setEditingFormat] = useState("");

  const [editingWishlistId, setEditingWishlistId] = useState(null);
  const [editingWishlistArtist, setEditingWishlistArtist] = useState("");
  const [editingWishlistTitle, setEditingWishlistTitle] = useState("");
  const [editingWishlistFormat, setEditingWishlistFormat] = useState("");

  const [editingChartId, setEditingChartId] = useState(null);
  const [editingChartArtist, setEditingChartArtist] = useState("");
  const [editingChartTitle, setEditingChartTitle] = useState("");
  const [editingChartCategory, setEditingChartCategory] = useState("alltime");
  const [editingChartComment, setEditingChartComment] = useState("");

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

    setMessage("Chart entry deleted");
    loadCharts();
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
    setMessage("");

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
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch(`/api/collection/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRelease),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update release");
      return;
    }

    cancelEdit();
    setMessage("Release updated");
    loadCollection();
  }

  function startWishlistEdit(item) {
    setEditingWishlistId(item.id);
    setEditingWishlistArtist(item.artist);
    setEditingWishlistTitle(item.title);
    setEditingWishlistFormat(item.format);
  }

  function cancelWishlistEdit() {
    setEditingWishlistId(null);
    setEditingWishlistArtist("");
    setEditingWishlistTitle("");
    setEditingWishlistFormat("");
  }

  async function saveWishlistEdit(id) {
    setMessage("");

    const updatedItem = {
      artist: editingWishlistArtist.trim(),
      title: editingWishlistTitle.trim(),
      format: editingWishlistFormat.trim(),
    };

    if (!updatedItem.artist || !updatedItem.title || !updatedItem.format) {
      setMessage("Artist, title and format are required");
      return;
    }

    const res = await fetch(`/api/wishlist/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update wishlist item");
      return;
    }

    cancelWishlistEdit();
    setMessage("Wishlist item updated");
    loadWishlist();
  }

  function startChartEdit(item) {
    setEditingChartId(item.id);
    setEditingChartArtist(item.artist);
    setEditingChartTitle(item.title);
    setEditingChartCategory(item.category || "alltime");
    setEditingChartComment(item.comment || "");
  }

  function cancelChartEdit() {
    setEditingChartId(null);
    setEditingChartArtist("");
    setEditingChartTitle("");
    setEditingChartCategory("alltime");
    setEditingChartComment("");
  }

  async function saveChartEdit(id) {
    setMessage("");

    const updatedItem = {
      artist: editingChartArtist.trim(),
      title: editingChartTitle.trim(),
      category: editingChartCategory,
      comment: editingChartComment.trim(),
    };

    if (!updatedItem.artist || !updatedItem.title || !updatedItem.category) {
      setMessage("Artist, title and category are required");
      return;
    }

    const res = await fetch(`/api/charts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not update chart entry");
      return;
    }

    cancelChartEdit();
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
            <ul>
              {wishlist.map((item) => (
                <li key={item.id} style={{ marginBottom: 12 }}>
                  {editingWishlistId === item.id ? (
                    <div>
                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingWishlistArtist}
                          onChange={(e) => setEditingWishlistArtist(e.target.value)}
                          placeholder="Artist"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingWishlistTitle}
                          onChange={(e) => setEditingWishlistTitle(e.target.value)}
                          placeholder="Title"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingWishlistFormat}
                          onChange={(e) => setEditingWishlistFormat(e.target.value)}
                          placeholder="Format"
                        />
                      </div>

                      <button onClick={() => saveWishlistEdit(item.id)}>💾 Save</button>
                      <button onClick={cancelWishlistEdit} style={{ marginLeft: 8 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <strong>{item.artist}</strong> – {item.title} ({item.format}){" "}
                      <button onClick={() => startWishlistEdit(item)}>✏️</button>
                      <button onClick={() => deleteWishlistItem(item.id)}>❌</button>
                    </div>
                  )}
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
                <option value="alltime">Alltime Favorites</option>
                <option value="current">Current Favourites</option>
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
            <ul>
              {charts.map((item) => (
                <li key={item.id} style={{ marginBottom: 16 }}>
                  {editingChartId === item.id ? (
                    <div>
                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingChartArtist}
                          onChange={(e) => setEditingChartArtist(e.target.value)}
                          placeholder="Artist"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <input
                          value={editingChartTitle}
                          onChange={(e) => setEditingChartTitle(e.target.value)}
                          placeholder="Title"
                        />
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <select
                          value={editingChartCategory}
                          onChange={(e) => setEditingChartCategory(e.target.value)}
                        >
                          <option value="alltime">Alltime Favorites</option>
                          <option value="current">Current Favourites</option>
                          <option value="recommendation">Recommendations</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: 6 }}>
                        <textarea
                          value={editingChartComment}
                          onChange={(e) => setEditingChartComment(e.target.value)}
                          placeholder="Comment (optional)"
                          rows={4}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <button onClick={() => saveChartEdit(item.id)}>💾 Save</button>
                      <button onClick={cancelChartEdit} style={{ marginLeft: 8 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div>
                        <strong>{item.artist}</strong> – {item.title}
                      </div>

                      <div style={{ fontSize: 14, marginTop: 4 }}>
                        Category:{" "}
                        <strong>
                          {CATEGORY_LABELS[item.category] || item.category}
                        </strong>
                      </div>

                      {item.comment ? (
                        <p style={{ margin: "6px 0" }}>{item.comment}</p>
                      ) : null}

                      <button onClick={() => startChartEdit(item)}>✏️</button>
                      <button onClick={() => deleteChartItem(item.id)}>❌</button>
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