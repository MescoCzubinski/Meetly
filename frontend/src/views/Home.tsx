import { useEffect, useState, useTransition } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { sessionQuery } from "@/lib/queries";
import { isValidCode } from "@/utils/isValidCode";
import type { Session } from "@/lib/storage";
import { Container } from "@/components/Container";
import { InputWithButton } from "@/components/InputWithButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Home = ({
  onHost,
  onJoin,
  sessions,
  onResume,
  onEnded,
}: {
  onHost: () => void;
  onJoin: (code: string) => void;
  sessions: Session[];
  onResume: (session: Session) => void;
  onEnded: (codes: string[]) => void;
}) => {
  const [code, setCode] = useState<string>("");
  const [checking, startChecking] = useTransition();
  const queryClient = useQueryClient();

  const codes = [...new Set(sessions.map((s) => s.code))];
  const lookups = useQueries({
    queries: codes.map((code) => sessionQuery(code)),
  });
  const active = sessions.filter((s) => lookups[codes.indexOf(s.code)].data);
  const ended = codes.filter((_, i) => lookups[i].data === false);
  const failed = lookups.filter((l) => l.isError && l.data === undefined);

  useEffect(() => {
    if (ended.length > 0) onEnded(ended);
  }, [ended, onEnded]);

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
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Or enter the code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onSubmit={(code) => {
                if (!isValidCode(code)) {
                  toast.add({
                    type: "error",
                    title: "Invalid code",
                    description: "The session code is 6 digits, e.g. 123456",
                  });
                  return;
                }
                startChecking(async () => {
                  try {
                    if (await queryClient.fetchQuery(sessionQuery(code)))
                      onJoin(code);
                    else
                      toast.add({
                        type: "error",
                        title: "Session not found",
                        description: `No session with code ${code}. It may have ended, so check the code or ask the host`,
                      });
                  } catch {
                    toast.add({
                      type: "error",
                      title: "Could not check the code",
                      description: "Check your connection and try again",
                    });
                  }
                });
              }}
              pending={checking}
              button={<Send />}
              buttonLabel="Join"
            />
          </CardContent>
        </Card>
        {(active.length > 0 || failed.length > 0) && (
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
              {failed.length > 0 && (
                <div role="alert" className="flex flex-col gap-2">
                  <p>Could not check some of your sessions.</p>
                  <Button
                    className="w-full"
                    disabled={failed.some((l) => l.isFetching)}
                    onClick={() =>
                      void Promise.all(failed.map((l) => l.refetch()))
                    }
                  >
                    Try again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};
