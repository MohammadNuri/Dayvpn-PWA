import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.tsx";

/**
 * Formats milliseconds into a MM:SS string.
 */
const formatTime = (ms: number): string => {
  if (ms < 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

/**
 * A hook that takes an expiry timestamp and returns a formatted MM:SS string.
 * It automatically logs the user out when the timer reaches zero.
 * @param expiryTime The timestamp (in ms) when the session expires.
 */
export const useCountDown = (expiryTime: number | null): string => {
  const [remainingTime, setRemainingTime] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    if (!expiryTime) {
      setRemainingTime("--:--");
      return;
    }

    // Set the initial time immediately
    const initialDiff = expiryTime - Date.now();
    setRemainingTime(formatTime(initialDiff));

    // Update the time every second
    const intervalId = setInterval(() => {
      const diff = expiryTime - Date.now();
      if (diff <= 0) {
        clearInterval(intervalId);
        setRemainingTime("00:00");
        logout(); // Log out when timer expires
      } else {
        setRemainingTime(formatTime(diff));
      }
    }, 1000);

    // Clear interval on component unmount or expiryTime change
    return () => clearInterval(intervalId);
  }, [expiryTime, logout]);

  return remainingTime;
};