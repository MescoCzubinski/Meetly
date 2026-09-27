import { useState, useEffect } from "react";
import { WS_URL } from "@/api";

export type Answer = { name: string; interests: string[]; active: boolean };
export type Link = [string, string, number];

// Passing `name` marks that user as present in the session while connected.
export const useWebSocket = (code: string, name?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [session, setSession] = useState<{ answers: Answer[]; links: Link[] }>(
    { answers: [], links: [] },
  );
  const [isConnected, setIsConnected] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!code) return;
    const params = new URLSearchParams({ code });
    if (name) params.set("name", name);
    const ws = new WebSocket(`${WS_URL}/session?${params}`);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "session") setSession(data);
    };

    ws.onclose = (event) => {
      // 4410: ended by host/expired/empty, 4404: session no longer exists
      if (event.code === 4410 || event.code === 4404) setEnded(true);
      setIsConnected(false);
      setSocket(null);
    };

    return () => ws.close();
  }, [code, name]);

  const sendMessage = (name: string, interests: string[]) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({ event: "answer", data: { name, interests } }),
      );
    }
  };

  return { ...session, ended, sendMessage };
};
