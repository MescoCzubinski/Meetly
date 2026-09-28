import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";

export type Answer = { name: string; interests: string[]; active: boolean };
export type Link = [string, string, number];

export const useWebSocket = (code: string, name?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [session, setSession] = useState<{ answers: Answer[]; links: Link[] }>({
    answers: [],
    links: [],
  });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!code) return;
    const params = new URLSearchParams({ code });
    if (name) params.set("name", name);
    const ws = new WebSocket(`${WS_URL}/session?${params}`);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "session") setSession(data);
    };

    ws.onclose = (event) => {
      if (event.code === 4410 || event.code === 4404) setEnded(true);
      setSocket(null);
    };

    return () => {
      ws.onmessage = ws.onclose = null;
      if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
      else ws.close();
    };
  }, [code, name]);

  const sendMessage = (name: string, interests: string[]) => {
    if (socket) {
      socket.send(
        JSON.stringify({ event: "answer", data: { name, interests } }),
      );
    }
  };

  return { ...session, ended, sendMessage };
};
