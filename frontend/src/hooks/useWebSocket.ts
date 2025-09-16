import { useState, useEffect } from "react";

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    return () => ws.close();
  }, [url]);

  const sendMessage = (name: string, interests: string[]) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ name, interests }));
    }
  };

  return { messages, isConnected, sendMessage };
};
