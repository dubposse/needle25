/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";
import Collection from "@/components/Collection";
import Wishlist from "@/components/Wishlist";
import Charts from "@/components/Charts";
import Modal from "@/components/Modal";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("collection");
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  useEffect(() => {
    async function init() {
      setIsLoadingAuth(true);
      await loadCurrentUser();
      setIsLoadingAuth(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) handleSessionExpired();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  async function handleLoginSuccess() {
    setIsLoadingAuth(true);
    await loadCurrentUser();
    setIsLoadingAuth(false);
  }

  function handleSessionExpired() {
    setUser(null);
    setShowProfile(false);
    setMessage("Your session has expired. Please log in again.");
  }

  async function handleDeleteAccount() {
    setMessage("");

    const res = await fetch("/api/auth/delete", {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not delete account");
      setShowDeleteConfirm(false);
      return;
    }

    setUser(null);
    setShowDeleteConfirm(false);
    setShowProfile(false);
    setMessage("Account deleted");
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
    setMessage("Logged out");
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
        <AuthForm onLoginSuccess={handleLoginSuccess} setMessage={setMessage} />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}>
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
              <p style={{ margin: "0 0 14px 0" }}>
                Username: <strong style={{ color: "#fff" }}>{user.username}</strong>
              </p>
              {user.email !== process.env.NEXT_PUBLIC_DEMO_EMAIL ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: "none",
                    border: "1px solid #5c1f1f",
                    color: "#c0392b",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Delete Account
                </button>
              ) : (
                <p style={{ margin: 0, fontSize: 11, color: "#555", fontStyle: "italic" }}>
                  Account deletion is not available in demo mode.
                </p>
              )}
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
            <Collection user={user} setMessage={setMessage} />
          )}

          {activeSection === "wishlist" && (
            <Wishlist user={user} setMessage={setMessage} />
          )}

          {activeSection === "charts" && (
            <Charts user={user} setMessage={setMessage} />
          )}
        </div>
      )}

      {showDeleteConfirm ? (
        <Modal title="Delete Account" onClose={() => setShowDeleteConfirm(false)}>
          <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            This will permanently delete your account and all associated data
            (collection, wishlist & charts). This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDeleteAccount}
              style={{
                background: "#c0392b",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Yes, delete my account
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                background: "none",
                border: "1px solid #444",
                color: "#aaa",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      ) : null}

      {message ? <p style={{ marginTop: 20 }}>{message}</p> : null}
    </main>
  );
}