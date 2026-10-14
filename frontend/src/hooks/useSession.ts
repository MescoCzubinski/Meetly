import { useState, useEffect } from "react";
import { WS_URL } from "@/lib/config";
import { closeSocket, isEnded } from "@/lib/socket";

export const useSession = (
  code: string,
  token?: string,
  anonymous = false,
) => {
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

  return { ended };
};
