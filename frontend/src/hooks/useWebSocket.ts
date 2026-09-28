import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";

export type Answer = { name: string; interests: string[]; active: boolean };
export type Link = [string, string, number];

export const closeSocket = (ws: WebSocket) => {
  ws.onmessage = ws.onclose = null;
  if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
  else ws.close();
};

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
    const presence = new WebSocket(`${WS_URL}/session?${params}`);
    const interests = new WebSocket(`${WS_URL}/interests?code=${code}`);

    const onClose = (event: CloseEvent) => {
      if (event.code === 4410 || event.code === 4404) setEnded(true);
    };
    presence.onclose = onClose;

    interests.onopen = () => {
      setSocket(interests);
    };

    interests.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "interests") setSession(data);
    };

    interests.onclose = (event) => {
      onClose(event);
      setSocket(null);
    };

    return () => {
      closeSocket(presence);
      closeSocket(interests);
    };
  }, [code, name]);

  const sendInterests = (name: string, interests: string[]) => {
    if (socket) {
      socket.send(
        JSON.stringify({ event: "interest", data: { name, interests } }),
      );
    }
  };

  return { ...session, ended, sendInterests };
};
