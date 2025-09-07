import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Guest from "./routes/Guest.tsx";
import Host from "./routes/Host.tsx";
export default function App() {
  const [interestsList, setInterestsList] = useState<string[]>([
    "programowanie",
    "TypeScript",
    "architektura",
    "TailwindCSS",
    "sztuka",
    "metal (polski)",
  ]);
  return (
    <Routes>
      <Route
        path="/host"
        element={
          <Host
            interestsList={interestsList}
            setInterestsList={setInterestsList}
          />
        }
      />
      <Route path="/guest" element={<Guest />} />
    </Routes>
  );
}
