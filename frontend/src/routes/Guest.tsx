import Container from "../components/Container";
import { useState, useEffect, use } from "react";
import { getData } from "../api/api";
export default function Guest() {
  const scale = [1, 2, 3, 4, 5];
  const API_URL = import.meta.env.VITE_API_URL;

  // Extract code from URL
  const code = window.location.search.replace("?code=", "");
  const [isCodeProperly, setIsCodeProperly] = useState(false);

  useEffect(() => {
    setIsCodeProperly(code.length === 6 && !isNaN(Number(code)));
  }, []);

  useEffect(() => {
    if (window.location.search.includes("?code=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const [selectedScale, setSelectedScale] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestsList, setInterestsList] = useState<string[]>([]);

  useEffect(() => {
    if (isCodeProperly) {
      getData(`${API_URL}/interests?code=${code}`).then((data) => {
        const list = Array.isArray(data.data?.interests)
          ? data.data.interests
          : [];
        setInterestsList(list);
      });
    }
  }, [code, isCodeProperly, API_URL]);

  return (
    <>
      {isCodeProperly ? (
        <Container>
          <div className="w-full flex flex-col gap-y-4">
            <h1>
              {selectedScale === null
                ? "In 1 to 5 scale, how much have you like to get me know?"
                : "Pick what are your interests too:"}
            </h1>
            {selectedScale === null ? (
              <div className="flex w-full justify-between">
                {scale.map((value) => (
                  <button
                    key={value}
                    className="w-11 h-11 font-medium rounded-full border-2 border-[var(--color-light)] hover:bg-[var(--color-light)]/25 transition"
                    onClick={() => {
                      setSelectedScale(value);
                    }}
                  >
                    <p>{value}</p>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex w-full justify-center">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {interestsList.map((interest) => (
                      <p
                        key={interest}
                        className={`border-[1.5px] border-[var(--color-light)] px-2 py-1 rounded-md hover:bg-[var(--color-light)]/10 transition ${
                          selectedInterests.includes(interest) &&
                          "bg-[var(--color-light)]/50"
                        }`}
                        onClick={() => {
                          if (!selectedInterests.includes(interest)) {
                            setSelectedInterests([
                              ...selectedInterests,
                              interest,
                            ]);
                          } else {
                            setSelectedInterests(
                              selectedInterests.filter((i) => i !== interest)
                            );
                          }
                        }}
                      >
                        {interest}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[var(--color-light)] rounded-md text-[var(--color-dark)] h-12 cursor-pointer text-2xl font-medium"
                  onClick={() => {}}
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </Container>
      ) : (
        <Container>
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
        </Container>
      )}
    </>
  );
}
