export const closeSocket = (ws: WebSocket) => {
  ws.onmessage = ws.onclose = null;
  if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
  else ws.close();
};

export const isEnded = (event: CloseEvent) =>
  [4401, 4404, 4410].includes(event.code);
