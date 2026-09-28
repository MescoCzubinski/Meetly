import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";

export type Answer = { name: string; interests: string[]; active: boolean };
export type Link = [string, string, number];

export const closeSocket = (ws: WebSocket) => {
  ws.onmessage = ws.onclose = null;
  if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
  else ws.close();
};

const isEnded = (event: CloseEvent) => [4401, 4404, 4410].includes(event.code);

export const useWebSocket = (
  code: string,
  token?: string,
  anonymous = false,
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [session, setSession] = useState<{ answers: Answer[]; links: Link[] }>({
    answers: [],
    links: [],
  });
  const [ended, setEnded] = useState(false);
  const presenceToken = anonymous ? undefined : token;

  useEffect(() => {
    if (!code) return;
    const params = new URLSearchParams(
      presenceToken ? { token: presenceToken } : { code },
    );
    const presence = new WebSocket(`${WS_URL}/session?${params}`);
    presence.onclose = (event) => {
      if (isEnded(event)) setEnded(true);
    };
    return () => closeSocket(presence);
  }, [code, presenceToken]);

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams({ token });
    const interests = new WebSocket(`${WS_URL}/interests?${params}`);

    interests.onopen = () => {
      setSocket(interests);
    };

    interests.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      if (event === "interests") setSession(data);
    };

    interests.onclose = (event) => {
      if (isEnded(event)) setEnded(true);
      setSocket(null);
    };

    return () => closeSocket(interests);
  }, [token]);

  const sendInterests = (interests: string[]) => {
    if (socket) {
      socket.send(JSON.stringify({ event: "interest", data: { interests } }));
    }
  };

  return { ...session, ended, sendInterests };
};
