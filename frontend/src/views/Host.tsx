import { useState, useEffect } from "react";
import { API_URL } from "../api";
import Container from "../components/Container";
import QRCode from "../components/QRCode";
import Profile from "../components/Profile";
import { Button } from "@/components/ui/button";

export default function Host({
  onDone,
}: {
  onDone: (code: string, name: string) => void;
}) {
  const URL = import.meta.env.VITE_URL;
  const [showQR, setShowQR] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch(`${API_URL}/sessions`, { method: "POST" }).then((res) =>
        res.json(),
      ),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]).then(([data]) => {
      if (!ignore) setCode(data.code);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Container>
      {showQR ? (
        <div className="flex flex-col w-full gap-6">
          <QRCode url={URL} code={code} />
          <Button
            size="lg"
            className="h-12 w-full text-2xl font-heading disabled:opacity-100 data-disabled:opacity-100"
            disabled={!code}
            onClick={() => setShowQR(false)}
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
