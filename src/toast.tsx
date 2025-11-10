import toast, { Toaster } from "react-hot-toast";
import React from "react";

// 🎭 Shared styles (base)
const baseStyle: React.CSSProperties = {
  borderRadius: "12px",
  padding: "14px 18px",
  fontSize: "15px",
  color: "#fff",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
};

// 🎨 Custom Toasts
export const showSuccessToast = (message: string) =>
  toast.success(message, {
    duration: 4000,
    position: "top-center",
    icon: "🎉",
    style: {
      ...baseStyle,
      background: "linear-gradient(135deg, #0f9d58, #34a853)",
      boxShadow: "0 8px 25px rgba(52, 168, 83, 0.3)",
    },
    iconTheme: {
      primary: "#00c853",
      secondary: "#fff",
    },
    className: "animate-toast-pop",
  });

export const showErrorToast = (message: string) =>
  toast.error(message, {
    duration: 5000,
    position: "top-center",
    icon: ["💀", "🔥", "🚫", "💣", "😵‍💫"][
      Math.floor(Math.random() * 5)
    ],
    style: {
      ...baseStyle,
      background: "linear-gradient(135deg, #2c2c2c, #1a1a1a)",
      border: "1px solid rgba(255, 80, 80, 0.3)",
      boxShadow: "0 8px 25px rgba(255, 0, 0, 0.25)",
    },
    iconTheme: {
      primary: "#ff4d4f",
      secondary: "#fff",
    },
    className: "animate-toast-pop",
  });

export const showInfoToast = (message: string) =>
  toast(message, {
    duration: 4000,
    position: "top-center",
    icon: "💡",
    style: {
      ...baseStyle,
      background: "linear-gradient(135deg, #1a237e, #283593)",
      boxShadow: "0 8px 25px rgba(63, 81, 181, 0.3)",
    },
    iconTheme: {
      primary: "#64b5f6",
      secondary: "#fff",
    },
    className: "animate-toast-pop",
  });

export const showWarningToast = (message: string) =>
  toast(message, {
    duration: 4500,
    position: "top-center",
    icon: "⚠️",
    style: {
      ...baseStyle,
      background: "linear-gradient(135deg, #f57c00, #ff9800)",
      boxShadow: "0 8px 25px rgba(255, 152, 0, 0.3)",
    },
    iconTheme: {
      primary: "#ffa726",
      secondary: "#fff",
    },
    className: "animate-toast-pop",
  });

export const showLoadingToast = (message: string) =>
  toast.loading(message, {
    position: "top-center",
    style: {
      ...baseStyle,
      background: "linear-gradient(135deg, #212121, #424242)",
      boxShadow: "0 8px 25px rgba(255,255,255,0.1)",
    },
    className: "animate-toast-pop",
  });

// 🧩 Add this component to your root layout (e.g., App.tsx)
export const ToastContainer = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 4000,
    }}
  />
);

export default {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
};
