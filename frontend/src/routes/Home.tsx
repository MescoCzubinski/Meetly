import { useState, useEffect } from "react";
import Container from "../components/Container";
export default function Home() {
  const [code, setCode] = useState<string>("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowError(false);
    }, 1300);
  }, [showError]);

  return (
    <Container>
      <div className="w-full flex flex-col gap-y-4">
        <h1>Hi, I'm meetly. Do you want to get somebody know?</h1>
        <button
          type="button"
          className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-xl"
          onClick={() => (window.location.href = "/host")}
        >
          Click to be a Host
        </button>
        <div className="flex h-12">
          <input
            type="text"
            id="interests"
            className="flex-grow"
            aria-label="input code"
            autoComplete="off"
            placeholder="Or enter the code here"
            onInput={(e) => setCode((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.length === 6) {
                window.location.href = "/guest?code=" + code;
              } else if (e.key === "Enter" && code.length !== 6) {
                setShowError(true);
              }
            }}
          />
          <button
            className="h-full aspect-square rounded-md ml-4 bg-[var(--color-light)] text-[var(--color-dark)] text-2xl text-center cursor-pointer"
            type="submit"
            onClick={() => {
              if (code.length === 6) {
                window.location.href = "/guest?code=" + code;
              } else {
                setShowError(true);
              }
            }}
          >
            &#10132;
          </button>
        </div>
        {showError && (
          <p className="w-full text-center">code is 6 characters long</p>
        )}
      </div>
    </Container>
  );
}
