import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  success: {
    bg: "linear-gradient(135deg, #10b981, #059669)",
    iconBg: "rgba(255,255,255,0.2)",
  },
  error: {
    bg: "linear-gradient(135deg, #ef4444, #dc2626)",
    iconBg: "rgba(255,255,255,0.25)",
  },
  warning: {
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
    iconBg: "rgba(255,255,255,0.25)",
  },
  info: {
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    iconBg: "rgba(255,255,255,0.25)",
  },
};

const Notification = ({ show, message, type = "info", onClose }) => {
  const [visible, setVisible] = useState(show);


  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250); // wait for exit animation
  };

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => handleClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  
  if (!show && !visible) return null;

  const style = COLORS[type] || COLORS.info;

  const jsx = (
    <>
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: style.bg,
          color: "#fff",
          padding: "16px 20px",
          borderRadius: "14px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: "320px",
          maxWidth: "520px",
          fontSize: "15px",
          fontWeight: 500,
          backdropFilter: "blur(12px)",
          animation: visible
            ? "notifIn 0.3s ease-out forwards"
            : "notifOut 0.25s ease-in forwards",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: style.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Message */}
        <div style={{ flex: 1, lineHeight: 1.5 }}>{message}</div>

        {/* Close */}
        <button
  onClick={handleClose}
  style={{
    background: "rgba(255, 255, 255, 0.26)",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  }}
>
  <span
    style={{
      lineHeight: 1,
      fontSize: "20px",
      fontWeight: 600,
      transform: "translateY(-1px)",
    }}
  >
    ×
  </span>
</button>

        {/* Progress bar */}
        {/* Progress overlay */}
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.12)",
                animation: "progressOverlay 3s linear forwards",
                pointerEvents: "none",
                borderRadius: "14px",
            }}
        />

          <div
            style={{
              height: "100%",
              background: "#fff",
              animation: "progress 3s linear forwards",
            }}
          />
        </div>

      <style>{`
        @keyframes notifIn {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes notifOut {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -16px); }
        }

        @keyframes progressOverlay {
            from { clip-path: inset(0 0 0 0); }
            to { clip-path: inset(0 100% 0 0); }
        }

      `}</style>
    </>
  );

  if (typeof document === "undefined") return jsx;
  return createPortal(jsx, document.body);
};

export default Notification;
