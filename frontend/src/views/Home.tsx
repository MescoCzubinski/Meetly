import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { API_URL } from "@/api";
import type { Session } from "@/storage";
import Container from "@/components/Container";
import InputWithButton from "@/components/InputWithButton";
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
              onSubmit={async (code) => {
                if (!/^\d{6}$/.test(code)) {
                  toast.add({
                    type: "error",
                    title: "Invalid code",
                    description: "The session code is 6 digits, e.g. 123456",
                  });
                } else if (
                  await fetch(`${API_URL}/sessions/${code}`)
                    .then((res) => res.ok)
                    .catch(() => false)
                ) {
                  onJoin(code);
                } else {
                  toast.add({
                    type: "error",
                    title: "Session not found",
                    description: `No session with code ${code}. It may have ended, so check the code or ask the host`,
                  });
                }
              }}
              button={<Send />}
              buttonLabel="Join"
            />
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
