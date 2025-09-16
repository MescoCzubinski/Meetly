import { useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import Container from "../components/Container";
export default function Resume() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const name = params.get("name") || "";
  const [response, setResponse] = useState<
    { name: string; interests: string[] }[]
  >([]);
  const { messages } = useWebSocket(`ws://localhost:8080/${code}`);

  useEffect(() => {
    if (window.location.search.includes("?code=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    try {
      const parsedMessages = messages.map((msg) => {
        try {
          return JSON.parse(msg);
        } catch (e) {
          console.warn("Failed to parse message:", msg);
          return null;
        }
      });
      setResponse(parsedMessages);
    } catch (e) {
      console.error("Error processing messages:", e);
    }
  }, [messages]);

  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4 h-screen pt-20 md:pt-10">
        <h1 className="h-8">Answers:</h1>
        <div className="flex flex-col w-full gap-y-4 overflow-scroll h-[calc(100vh-80px-32px)] md:h-[calc(100vh-40px-32px)] scrollbar-hidden pb-4">
          {response
            .filter((res) => res.name !== name)
            .map((res, index) => (
              <div
                key={index}
                className="bg-[var(--color-dark)] border border-[var(--color-light)] rounded-md p-2"
              >
                <div className="flex flex-wrap gap-2">
                  <div className="text-2xl md:text-lg text-[var(--color-primary)]">
                    {res.name}:
                  </div>
                  {res.interests.map((interest, i) => (
                    <p key={i}>
                      {interest}
                      {i < res.interests.length - 1 && ","}
                    </p>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Container>
  );
}
