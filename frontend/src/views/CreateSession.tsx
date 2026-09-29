import { useState, useEffect } from "react";
import { createSession } from "@/lib/api";
import { saveHostToken } from "@/lib/storage";
import Container from "@/components/Container";
import QRCode from "@/components/QRCode";
import { Button } from "@/components/ui/button";

export default function CreateSession({
  onDone,
}: {
  onDone: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([
      createSession(),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]).then(([data]) => {
      if (ignore) return;
      saveHostToken(data.code, data.hostToken);
      setCode(data.code);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Container>
      <div className="flex w-full flex-col gap-6">
        <QRCode code={code} />
        <Button
          size="lg"
          className="h-12 w-full text-2xl font-heading disabled:opacity-100 data-disabled:opacity-100"
          disabled={!code}
          onClick={() => onDone(code)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}
