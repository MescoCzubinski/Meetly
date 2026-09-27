import { useState, useEffect } from "react";
import { createSession } from "@/lib/api";
import { saveHostToken } from "@/lib/storage";
import Container from "@/components/Container";
import QRCode from "@/components/QRCode";
import Profile from "@/components/Profile";
import { Button } from "@/components/ui/button";

export default function Host({
  onCode,
  onDone,
}: {
  onCode: (code: string) => void;
  onDone: (code: string, name: string) => void;
}) {
  const [showQR, setShowQR] = useState(true);
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
      {showQR ? (
        <div className="flex flex-col w-full gap-6">
          <QRCode code={code} />
          <Button
            size="lg"
            className="h-12 w-full text-2xl font-heading disabled:opacity-100 data-disabled:opacity-100"
            disabled={!code}
            onClick={() => {
              setShowQR(false);
              onCode(code);
            }}
          >
            Next
          </Button>
        </div>
      ) : (
        <Profile code={code} onDone={(name) => onDone(code, name)} />
      )}
    </Container>
  );
}
