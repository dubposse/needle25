"use client";

import { useState } from "react";
import { legal } from "@/lib/legal";

export default function Footer() {
  const [open, setOpen] = useState(null); // "impressum" | "datenschutz" | null
  const [lang, setLang] = useState("de");

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
          Impressum
        </button>
        <button
          onClick={() => setOpen("datenschutz")}
          style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          Datenschutz
        </button>
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
