import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

export default function App() {
  const { messages, isConnected, sendMessage } = useWebSocket(
    "ws://localhost:8080"
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input, ["sd", "dfs"]);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>WebSocket Test</h1>

      <div>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</div>

      <div style={{ margin: "20px 0" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>
          Send
        </button>
      </div>

      <div>
        <h3>Messages:</h3>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ padding: "5px", background: "#f0f0f0", margin: "5px 0" }}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
