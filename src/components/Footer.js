"use client";

import { useState } from "react";
import { legal } from "@/lib/legal";

export default function Footer() {
  const [open, setOpen] = useState(null); // "impressum" | "datenschutz" | null
  const [lang, setLang] = useState("de");
  const [showEmail, setShowEmail] = useState(false);

  const current = open ? legal[lang][open] : null;

  return (
    <>
      <footer
        style={{
          padding: "16px 24px",
          display: "flex",
          gap: 16,
          fontSize: 12,
          color: "#444",
          borderTop: "1px solid #1e1e1e",
        }}
      >
        <button
          onClick={() => setOpen("impressum")}
          style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          Imprint
        </button>
        <button
          onClick={() => setOpen("datenschutz")}
          style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          Privacy Policy
        </button>
        <a
          href="https://github.com/matthiasbrehm/needle25"
          target="_blank"
          rel="noopener noreferrer"
          title="Source code (AGPL-3.0)"
          style={{ color: "#444", display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {showEmail && (
            <span style={{ color: "#555", fontSize: 12 }}>matthiasbrehm1@gmx.de</span>
          )}
          <button
            onClick={() => setShowEmail((v) => !v)}
            title="Contact"
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 14 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
          </button>
        </span>
      </footer>

      {open && (
        <div
          onClick={() => setOpen(null)}
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
              maxWidth: 560,
              maxHeight: "80vh",
              background: "#141414",
              color: "#e8e8e8",
              border: "1px solid #242424",
              borderRadius: 14,
              padding: "24px 24px 20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{current.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, fontSize: 12 }}>
                  <button
                    onClick={() => setLang("de")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                      color: lang === "de" ? "#e8e8e8" : "#555",
                      fontWeight: lang === "de" ? 600 : 400,
                    }}
                  >
                    DE
                  </button>
                  <span style={{ color: "#333" }}>|</span>
                  <button
                    onClick={() => setLang("en")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                      color: lang === "en" ? "#e8e8e8" : "#555",
                      fontWeight: lang === "en" ? 600 : 400,
                    }}
                  >
                    EN
                  </button>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  style={{ background: "none", border: "none", color: "#666", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "0 2px" }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ overflowY: "auto", fontSize: 14, lineHeight: 1.7, color: "#aaa", whiteSpace: "pre-wrap" }}>
              {current.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
