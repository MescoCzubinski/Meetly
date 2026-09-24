import { useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import Container from "../components/Container";
export default function Resume() {
  const [params] = useState(new URLSearchParams(window.location.search));
  const code = params.get("code") || "";
  const name = params.get("name") || "";
  const { answers } = useWebSocket(code);

  useEffect(() => {
    if (window.location.search.includes("?code=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4 h-screen pt-20 md:pt-10">
        <h1 className="h-8">Answers:</h1>
        <div className="flex flex-col w-full gap-y-4 overflow-scroll h-[calc(100vh-80px-32px)] md:h-[calc(100vh-40px-32px)] scrollbar-hidden pb-4">
          {answers
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
