import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

export const toastOptions = {
  duration: 4000,
  // Base style with modern glassmorphic look & smooth micro-interactions
  style: {
    borderRadius: "0.75rem", // 12px
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },

  // Success: Vibrant Emerald Glass
  success: {
    duration: 3500,
    icon: (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
        <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
      </div>
    ),
    style: {
      background: "rgba(6, 78, 59, 0.85)", // dark emerald backdrop
      color: "#ecfdf5",
      border: "1px solid rgba(52, 211, 153, 0.35)",
      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(52, 211, 153, 0.1)",
    },
  },

  // Error: Crimson Glow Glass
  error: {
    duration: 5000, // slightly longer for errors
    icon: (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-500/30">
        <XCircleIcon className="h-4 w-4 text-rose-400" />
      </div>
    ),
    style: {
      background: "rgba(136, 19, 55, 0.85)", // dark rose backdrop
      color: "#fff1f2",
      border: "1px solid rgba(251, 113, 133, 0.35)",
      boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.2), 0 0 0 1px rgba(251, 113, 133, 0.1)",
    },
  },

  // Warning: Amber Glow Glass
  warning: {
    duration: 4500,
    icon: (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
        <ExclamationTriangleIcon className="h-4 w-4 text-amber-300" />
      </div>
    ),
    style: {
      background: "rgba(120, 53, 15, 0.85)", // dark amber backdrop
      color: "#fffbeb",
      border: "1px solid rgba(251, 191, 36, 0.35)",
      boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(251, 191, 36, 0.1)",
    },
  },

  // Info: Cyan/Sky Blue Glass
  info: {
    duration: 4000,
    icon: (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/15 ring-1 ring-cyan-500/30">
        <InformationCircleIcon className="h-4 w-4 text-cyan-300" />
      </div>
    ),
    style: {
      background: "rgba(12, 74, 110, 0.85)", // dark sky backdrop
      color: "#f0f9ff",
      border: "1px solid rgba(56, 189, 248, 0.35)",
      boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.2), 0 0 0 1px rgba(56, 189, 248, 0.1)",
    },
  },
};
