import axios from "axios";
import { formatTelegramMessage } from "./formatter";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN = import.meta.env.VITE_API_TOKEN;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export const sendTelegramMessage = async (data: any) => {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = Number(import.meta.env.VITE_TELEGRAM_CHAT_ID);

    let formatted: string;
    
    // بررسی اینکه داده JSON هست یا نه
    if (typeof data === "object") {
      formatted = formatTelegramMessage(data);
    } else if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        formatted = formatTelegramMessage(parsed);
      } catch {
        formatted = data; // اگر پارس نشد یعنی متن ساده‌ست
      }
    } else {
      formatted = String(data);
    }

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: formatted,
      }
    );
  } catch (error: any) {
    console.error("Telegram send error:", error.response?.data || error.message);
  }
};

