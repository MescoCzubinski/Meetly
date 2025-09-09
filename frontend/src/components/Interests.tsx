export default function Interests({
  interestsList,
  setInterestsList,
}: {
  interestsList: string[];
  setInterestsList: (interests: string[]) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-y-4">
        <label htmlFor="interests">
          <h1 className="">Enter your interests, then generate a QR code:</h1>
        </label>
        <div className="flex h-12">
          <input
            type="text"
            id="interests"
            autoFocus
            placeholder="Type your interests"
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  setInterestsList([...interestsList, value]);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            className="h-full aspect-square rounded-md ml-4 bg-[var(--color-light)] text-[var(--color-dark)] text-4xl text-center cursor-pointer"
            type="submit"
            onClick={() => {
              const input = document.getElementById(
                "interests"
              ) as HTMLInputElement;
              const value = input.value.trim();
              if (value) {
                setInterestsList([...interestsList, value]);
                input.value = "";
              }
            }}
          >
            +
          </button>
        </div>
        <div className="flex gap-x-4 gap-y-2 flex-wrap justify-center">
          {interestsList.length > 0 ? (
            interestsList.map((interest, index) => (
              <p key={index}>
                {interest}
                <span
                  onClick={() =>
                    setInterestsList(
                      interestsList.filter((_, i) => i !== index)
                    )
                  }
                >
                  &#215;
                </span>
              </p>
            ))
          ) : (
            <>
              <p className="opacity-50">E.g.</p>
              <p className="opacity-50">
                Fantasy books <span>&#215;</span>
              </p>
              <p className="opacity-50">
                Gym <span>&#215;</span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
