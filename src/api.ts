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

    let message: string;
    
    try {
      // سعی می‌کنیم data رو parse کنیم
      const parsed = JSON.parse(data);
      message = formatTelegramMessage(parsed);
    } catch (parseError) {
      // اگر parse نشد، خود data رو به عنوان message استفاده می‌کنیم
      message = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );
  } catch (error: any) {
    console.error("Telegram send error:", error.response?.data || error.message);
  }
};
