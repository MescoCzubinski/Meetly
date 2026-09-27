import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { API_URL } from "../api";
import type { Session } from "../storage";
import Container from "../components/Container";
import InputWithButton from "../components/InputWithButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home({
  onHost,
  onJoin,
  sessions,
  onResume,
}: {
  onHost: () => void;
  onJoin: (code: string) => void;
  sessions: Session[];
  onResume: (session: Session) => void;
}) {
  const [code, setCode] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Session[]>([]);

  useEffect(() => {
    let ignore = false;
    Promise.all(
      sessions.map((session) =>
        fetch(`${API_URL}/sessions/${session.code}`)
          .then((res) => res.ok)
          .catch(() => false),
      ),
    ).then((exists) => {
      if (!ignore) setActive(sessions.filter((_, i) => exists[i]));
    });
    return () => {
      ignore = true;
    };
  }, [sessions]);

  useEffect(() => {
    if (!showError) return;
    const timer = setTimeout(() => setShowError(false), 1300);
    return () => clearTimeout(timer);
  }, [showError]);

  return (
    <Container>
      <div className="flex w-full flex-col gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl leading-tight">
                Hi, I'm Meetly! Do you want to get somebody know?
              </h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" className="w-full text-lg" onClick={onHost}>
              Click to be a Host
            </Button>
            <InputWithButton
              aria-label="input code"
              inputMode="numeric"
              placeholder="Or enter the code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onSubmit={async () => {
                const fail = (message: string) => {
                  setError(message);
                  setShowError(true);
                };
                if (!/^\d{6}$/.test(code)) return fail("code is 6 digits long");
                const exists = await fetch(`${API_URL}/sessions/${code}`)
                  .then((res) => res.ok)
                  .catch(() => false);
                if (exists) onJoin(code);
                else fail("session not found");
              }}
              button={<Send />}
              buttonLabel="Join"
            />
            <div
              aria-hidden={!showError}
              className={`-mt-4 grid transition-[grid-template-rows] duration-300 ${showError ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="pt-4 w-full text-center">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {active.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl">Your sessions</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {active.map((session) => (
                <Button
                  key={`${session.code}-${session.name}`}
                  variant="neutral"
                  className="w-full justify-between text-base"
                  onClick={() => onResume(session)}
                >
                  <span>{session.code}</span>
                  <span>as {session.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
