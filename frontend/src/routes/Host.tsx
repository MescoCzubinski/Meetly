import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { API_URL } from "../api";
import Container from "../components/Container";
import QRCode from "../components/QRCode";
import Name from "../components/Name";
import Interests from "../components/Interests";
export default function Host() {
  const URL = import.meta.env.VITE_URL;
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(true);
  const [showName, setShowName] = useState(false);
  const [showInterests, setShowInterests] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [interestsList, setInterestsList] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;
    fetch(`${API_URL}/sessions`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setCode(data.code);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const { isConnected, sendMessage } = useWebSocket(code);

  const handleSend = () => {
    if (isConnected) {
      sendMessage(name, interestsList);
    }
  };

  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4">
        {showQR && (
          <>
            <QRCode url={URL} code={code} />
            <button
              type="submit"
              className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-2xl font-medium"
              onClick={() => {
                setShowQR(false);
                setShowName(true);
              }}
            >
              Next
            </button>
          </>
        )}
        {showName && (
          <>
            <Name
              setName={setName}
              setShowName={setShowName}
              setShowInterests={setShowInterests}
            />
            <button
              type="submit"
              className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-2xl font-medium"
              onClick={() => {
                if (name !== "") {
                  setShowName(false);
                  setShowInterests(true);
                }
              }}
            >
              Send
            </button>
          </>
        )}
        {showInterests && (
          <>
            <Interests
              interestsList={interestsList}
              setInterestsList={setInterestsList}
            />
            <button
              type="submit"
              className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-2xl font-medium"
              onClick={() => {
                if (interestsList.length > 0) {
                  handleSend();
                  navigate("/resume?code=" + code + "&name=" + name);
                }
              }}
            >
              Send
            </button>
          </>
        )}
      </div>
    </Container>
  );
}
