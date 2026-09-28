import { useEffect, useState } from "react";
import { sessionExists } from "@/lib/api";
import Container from "@/components/Container";
import Profile from "@/components/Profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JoinSession({
  code,
  onCode,
  onDone,
  onHome,
}: {
  code: string;
  onCode: (code: string) => void;
  onDone: (name: string) => void;
  onHome: () => void;
}) {
  const [exists, setExists] = useState<boolean>();

  useEffect(() => {
    let ignore = false;
    sessionExists(code).then((ok) => {
      if (ignore) return;
      setExists(ok === true);
      if (ok) onCode(code);
    });
    return () => {
      ignore = true;
    };
  }, [code, onCode]);

  return (
    <Container>
      {exists === undefined ? null : exists ? (
        <Profile code={code} onDone={onDone} />
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl">Invalid code...</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please check the code and try again.</p>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full text-lg" onClick={onHome}>
              Go to main page
            </Button>
          </CardFooter>
        </Card>
      )}
    </Container>
  );
}
