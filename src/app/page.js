"use client";

import { useEffect, useState } from "react";
import { GENRES } from "@/lib/genres";

const CATEGORY_LABELS = {
  alltime: "All-time favorites",
  current: "Current favorites",
  recommendation: "Recommendations",
};

function Modal({ title, children, onClose, maxWidth = 480 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: maxWidth,
          background: "#141414",
          color: "#e8e8e8",
          border: "1px solid #242424",
          borderRadius: 14,
          padding: "24px 24px 20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
              padding: "0 2px",
            }}
          >
            ✕
          </button>
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

  const [activeSection, setActiveSection] = useState("collection");

  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [showAddCharts, setShowAddCharts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [artistFilter, setArtistFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showArtistSearch, setShowArtistSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [message, setMessage] = useState("");

  const [favoriteGenre1, setFavoriteGenre1] = useState("");
  const [favoriteGenre2, setFavoriteGenre2] = useState("");  

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
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const FORMAT_OPTIONS = ["", "vinyl", "cd", "tape"];
  const FORMAT_LABELS = { "": "All", vinyl: "Vinyl", cd: "CD", tape: "Tape" };
  function cycleFormat() {
    const i = FORMAT_OPTIONS.indexOf(formatFilter);
    setFormatFilter(FORMAT_OPTIONS[(i + 1) % FORMAT_OPTIONS.length]);
  }

  const SORT_OPTIONS = ["newest", "oldest", "artist_asc"];
  const SORT_LABELS = { newest: "New ↓", oldest: "Old ↑", artist_asc: "A–Z" };
  function cycleSort() {
    const i = SORT_OPTIONS.indexOf(sortBy);
    setSortBy(SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length]);
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
            favoriteGenre1,
            favoriteGenre2,
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
    setShowAddCollection(false);
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
    setShowAddWishlist(false);
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
    setShowAddCharts(false);
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
    <main style={{ padding: "0 24px", maxWidth: 680, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ flexShrink: 0, paddingTop: 28, paddingBottom: 16, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <img src="/logo.png" alt="Needle25" style={{ height: 42, width: "auto" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>&ensp;Needle25</h1>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 14, color: "#666" }}>
          <a href="/" style={{ color: "#666" }}>Home</a>
          <a href="/discover" style={{ color: "#666" }}>Discover</a>
        </div>
      </div>
      

      {!user ? (
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px 0" }}>
            Organize your music collection,<br /> wishlist & personal charts - 
            <br />
            discover what others are listening to.
          </p>
          <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            All data is private <br />- only your curated charts are public by default
          </p>
        </div>

          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{authMode === "register" ? "Register" : "Login"}</h2>

          {authMode === "login" && (
            <p style={{ marginBottom: 14, fontSize: 12, color: "#444", maxWidth: 320, lineHeight: 1.8 }}>
              Demo Access <br />Email: test@needle25<br />Password: secret123
            </p>
          )}

          <form onSubmit={handleAuthSubmit} style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
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
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>

                <select
                  value={favoriteGenre2}
                  onChange={(e) => setFavoriteGenre2(e.target.value)}
                >
                  <option value="">Favorite genre 2</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
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
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
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
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
          {/* Dezente Kopfzeile: Username, Charts-Link, Logout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
              fontSize: 13,
              color: "#888",
            }}
          >
            <button
              onClick={() => setShowProfile((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
              }}
            >
              {user.username} {showProfile ? "▲" : "▼"}
            </button>

            <a
              href={`/charts/${user.username}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#888", textDecoration: "none" }}
            >
              My Charts ↗
            </a>

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                marginLeft: "auto",
              }}
            >
              Logout
            </button>
          </div>

          {/* Aufklappbarer Profil-Bereich */}
          {showProfile && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                fontSize: 13,
                color: "#aaa",
              }}
            >
              <p style={{ margin: "0 0 6px 0" }}>
                Email: <strong style={{ color: "#fff" }}>{user.email}</strong>
              </p>
              <p style={{ margin: 0 }}>
                Username: <strong style={{ color: "#fff" }}>{user.username}</strong>
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["collection", "wishlist", "charts"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  padding: "8px 16px",
                  background: activeSection === section ? "#fff" : "transparent",
                  color: activeSection === section ? "#000" : "#aaa",
                  border: "1px solid",
                  borderColor: activeSection === section ? "#fff" : "#444",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: activeSection === section ? 600 : 400,
                }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
          </div>

          {activeSection === "collection" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
          <h2>My Collection</h2>

          <button onClick={() => setShowAddCollection(true)} style={{ marginBottom: 20 }}>
            + Add Release
          </button>

          <div style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
            <button
              onClick={cycleFormat}
              style={{
                background: "none",
                border: "none",
                color: formatFilter ? "#ccc" : "#888",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                flexShrink: 0,
                width: 52,
                textAlign: "left",
              }}
            >
              {FORMAT_LABELS[formatFilter]} ▾
            </button>

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

            <div style={{ width: 200, flexShrink: 0, position: "relative", marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
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

          </div>
          </div>
          )}

          {activeSection === "wishlist" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
          <h2>My Wishlist</h2>

          <button onClick={() => setShowAddWishlist(true)} style={{ marginBottom: 20 }}>
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

          </div>
          </div>
          )}

          {activeSection === "charts" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
          <h2>My Charts</h2>

          <button onClick={() => setShowAddCharts(true)} style={{ marginBottom: 20 }}>
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
          </div>
          </div>
          )}
        </div>
      )}

      {showArtistSearch && (
        <Modal title="Search by artist" onClose={() => setShowArtistSearch(false)} maxWidth={320}>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              placeholder="Search by artist..."
              style={{ width: "100%", paddingRight: artistFilter ? 28 : undefined, boxSizing: "border-box" }}
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

      {showAddCollection ? (
        <Modal title="Add Release" onClose={() => setShowAddCollection(false)}>
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
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Format (vinyl, cd, tape...)"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <button type="submit">Add Release</button>
          </form>
        </Modal>
      ) : null}

      {showAddWishlist ? (
        <Modal title="Add Wishlist Item" onClose={() => setShowAddWishlist(false)}>
          <form onSubmit={handleWishlistSubmit}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={wishlistArtist}
                onChange={(e) => setWishlistArtist(e.target.value)}
                placeholder="Artist"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                value={wishlistTitle}
                onChange={(e) => setWishlistTitle(e.target.value)}
                placeholder="Title"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <input
                value={wishlistFormat}
                onChange={(e) => setWishlistFormat(e.target.value)}
                placeholder="Format (vinyl, cd, tape...)"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <button type="submit">Add Wishlist Item</button>
          </form>
        </Modal>
      ) : null}

      {showAddCharts ? (
        <Modal title="Add Chart Entry" onClose={() => setShowAddCharts(false)}>
          <form onSubmit={handleChartSubmit}>
            <div style={{ marginBottom: 10 }}>
              <input
                value={chartArtist}
                onChange={(e) => setChartArtist(e.target.value)}
                placeholder="Artist"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Title"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <select
                value={chartCategory}
                onChange={(e) => setChartCategory(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="alltime">All-time favorites</option>
                <option value="current">Current favorites</option>
                <option value="recommendation">Recommendations</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <textarea
                value={chartComment}
                onChange={(e) => setChartComment(e.target.value)}
                placeholder="Comment (optional)"
                rows={4}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <button type="submit">Add Chart Entry</button>
          </form>
        </Modal>
      ) : null}

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