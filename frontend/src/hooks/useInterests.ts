import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";
import { closeSocket, isEnded } from "@/lib/socket";

export type Answer = { name: string; interests: string[]; active: boolean };
export type Link = [string, string, number];

export const useInterests = (token?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [session, setSession] = useState<{ answers: Answer[]; links: Link[] }>({
    answers: [],
    links: [],
  });
  const [ended, setEnded] = useState(false);

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

  return { ...session, ended, ready: socket !== null, sendInterests };
};
