export default function Name({
  setName,
  setShowName,
  setShowInterests,
}: {
  setName: (name: string) => void;
  setShowName: (show: boolean) => void;
  setShowInterests: (show: boolean) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-y-4">
        <label htmlFor="name">
          <h1 className="">Enter your name, confirm:</h1>
        </label>
        <div className="flex h-12">
          <input
            type="text"
            id="name"
            autoFocus
            placeholder="Enter your name"
            className="flex-grow"
            onKeyDown={(e) => {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                setName(value);
              }
              if (e.key === "Enter" && value) {
                setName(value);
                setShowName(false);
                setShowInterests(true);
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
