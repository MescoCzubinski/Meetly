import Container from "../components/Container";
import Interests from "../components/Interests";
import QRCode from "../components/QRCode";
import { useState, useEffect } from "react";
import { sendData } from "../api/api";
export default function Host() {
  const URL = import.meta.env.VITE_URL;
  const API_URL = import.meta.env.VITE_API_URL;
  const [showQR, setShowQR] = useState(false);
  const [code, setCode] = useState(
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const [interestsList, setInterestsList] = useState<string[]>([]);

  useEffect(() => {
    if (showQR) {
      setCode(Math.floor(100000 + Math.random() * 900000).toString());
    }
  }, [showQR]);

  useEffect(() => {
    if (interestsList.length > 0) {
      sendData(`${API_URL}/interests`, {
        code: code,
        interests: interestsList,
      });
    }
  }, [showQR, interestsList, code, API_URL]);

  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4">
        {showQR ? (
          <QRCode url={URL} code={code} />
        ) : (
          <Interests
            interestsList={interestsList}
            setInterestsList={setInterestsList}
          />
        )}
        <button
          type="submit"
          className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-2xl font-medium"
          onClick={() => {
            setShowQR(!showQR);
          }}
        >
          {showQR ? "Undo" : "Generate QR Code"}
        </button>
      </div>
    </Container>
  );
}
