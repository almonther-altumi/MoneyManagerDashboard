import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  success: {
    accent: "var(--success, #16a34a)",
  },
  error: {
    accent: "var(--danger, #ef4444)",
  },
  warning: {
    accent: "var(--warning, #f59e0b)",
  },
  info: {
    accent: "var(--primary, #2563eb)",
  },
};

const Notification = ({ show, message, type = "info", onClose }) => {
  const [visible, setVisible] = useState(show);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => handleClose(), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show]);

  if (!show && !visible) return null;

  const style = COLORS[type] || COLORS.info;
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const jsx = (
    <>
      <div
        className="notification-toast"
        style={{
          position: "fixed",
          bottom: "24px",
          left: isRtl ? "auto" : "24px",
          right: isRtl ? "24px" : "auto",
          background: "var(--bg-light)",
          color: "var(--text)",
          padding: "12px 14px",
          borderRadius: "14px",
          border: "1px solid var(--border-muted)",
          borderLeft: !isRtl ? `3px solid ${style.accent}` : undefined,
          borderRight: isRtl ? `3px solid ${style.accent}` : undefined,
          boxShadow: "0 16px 32px rgba(0,0,0,0.2)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "240px",
          maxWidth: "calc(100vw - 48px)",
          fontSize: "14px",
          fontWeight: 600,
          backdropFilter: "blur(10px)",
          direction: isRtl ? "rtl" : "ltr",
          animation: visible
            ? "notifIn 0.3s ease-out forwards"
            : "notifOut 0.25s ease-in forwards",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "var(--bg)",
            border: "1px solid var(--border-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={style.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        <div style={{ flex: 1, lineHeight: 1.45 }}>{message}</div>

        <button
          type="button"
          className="notification-close"
          aria-label="Close notification"
          onClick={handleClose}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border-muted)",
            width: "30px",
            height: "30px",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          <span
            style={{
              lineHeight: 1,
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            x
          </span>
        </button>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "2px",
            background: "rgba(15, 23, 42, 0.08)",
            borderRadius: "0 0 14px 14px",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              background: style.accent,
              transformOrigin: isRtl ? "right" : "left",
              animation: "progress 3s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        .notification-close:hover {
          transform: none !important;
          box-shadow: none !important;
          border-color: var(--border-muted) !important;
          background: var(--bg) !important;
        }

        @keyframes notifIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes notifOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(16px); }
        }

        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </>
  );

  if (typeof document === "undefined") return jsx;
  return createPortal(jsx, document.body);
};

export default Notification;
