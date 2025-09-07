import Container from "../components/Container";
import Interests from "../components/Interests";
import QRCode from "../components/QRCode";
import { useState } from "react";
export default function Host({
  interestsList,
  setInterestsList,
}: {
  interestsList: string[];
  setInterestsList: (interests: string[]) => void;
}) {
  const [showQR, setShowQR] = useState(false);
  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4">
        {showQR ? (
          <QRCode url="http://localhost:5173/guest" />
        ) : (
          <Interests
            interestsList={interestsList}
            setInterestsList={setInterestsList}
          />
        )}
        <button
          type="submit"
          className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-xl"
          onClick={() => setShowQR(!showQR)}
        >
          {showQR ? "Powrót" : "Generuj kod QR"}
        </button>
      </div>
    </Container>
  );
}
