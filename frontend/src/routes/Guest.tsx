import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import Container from "../components/Container";
import Name from "../components/Name";
import Interests from "../components/Interests";
export default function Guest() {
  const navigate = useNavigate();
  const [code] = useState(window.location.search.replace("?code=", ""));
  const [isCodeProperly] = useState(code.length === 6 && !isNaN(Number(code)));

  useEffect(() => {
    if (window.location.search.includes("?code=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [showName, setShowName] = useState(true);
  const [showInterests, setShowInterests] = useState(false);

  const [name, setName] = useState("");
  const [interestsList, setInterestsList] = useState<string[]>([]);

  const { isConnected, sendMessage } = useWebSocket(code);

  const handleSend = () => {
    if (isConnected) {
      sendMessage(name, interestsList);
    }
  };

  return (
    <Container>
      {isCodeProperly ? (
        <div className="flex flex-col w-full gap-y-4">
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
      ) : (
        <div className="w-full flex flex-col gap-y-4">
          <h1>Invalid code...</h1>
          <button
            type="button"
            className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-xl"
            onClick={() => (window.location.href = "/")}
          >
            Go to main page
          </button>
          <p>Please check the code and try again.</p>
        </div>
      )}
    </Container>
  );
}
