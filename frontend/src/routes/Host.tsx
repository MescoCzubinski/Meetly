import Container from "../components/Container";
import Interests from "../components/Interests";
import QRCode from "../components/QRCode";
import { useState } from "react";
export default function Host() {
  const URL = import.meta.env.VITE_URL;
  const [showQR, setShowQR] = useState(false);
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const [code, setCode] = useState(randomNumber.toString());
  const [interestsList, setInterestsList] = useState<string[]>([]);

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
            setCode(randomNumber.toString());
            setShowQR(!showQR);
          }}
        >
          {showQR ? "Undo" : "Generate QR Code"}
        </button>
      </div>
    </Container>
  );
}
