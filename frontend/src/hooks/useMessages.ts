import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";
import { closeSocket } from "@/hooks/useWebSocket";

export type ChatMessage = {
  from: string;
  to: string;
  text: string;
  sentAt: number;
};

export const useMessages = (token: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ token });
    const ws = new WebSocket(`${WS_URL}/messages?${params}`);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "messages") setMessages(data);
      if (event === "message") setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => closeSocket(ws);
  }, [token]);

  const sendMessage = (to: string, text: string) => {
    if (socket) {
      socket.send(JSON.stringify({ event: "message", data: { to, text } }));
    }
  };

  return { messages, sendMessage };
};
