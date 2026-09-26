import { useState, useEffect } from "react";
import { WS_URL } from "../api";

export type Answer = { name: string; interests: string[] };
export type Link = [string, string, number];

export const useWebSocket = (code: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [session, setSession] = useState<{ answers: Answer[]; links: Link[] }>(
    { answers: [], links: [] },
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!code) return;
    const ws = new WebSocket(`${WS_URL}/session?code=${code}`);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "session") setSession(data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    return () => ws.close();
  }, [code]);

  const sendMessage = (name: string, interests: string[]) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({ event: "answer", data: { name, interests } }),
      );
    }
  };

  return { ...session, sendMessage };
};
