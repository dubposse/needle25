/**
 * Needle25 - Personal music collection manager and chart sharing platform for vinyl, tape, and CD enthusiasts.
 * Copyright (C) 2026 Matthias Brehm
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)
 */

"use client";

export default function Modal({ title, children, onClose, maxWidth = 480 }) {
  function handleClose() {
    if (document.activeElement) document.activeElement.blur();
    onClose();
  }

  return (
    <div
      onClick={handleClose}
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
            onClick={handleClose}
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
