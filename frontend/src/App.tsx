import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home.tsx";
import Guest from "./routes/Guest.tsx";
import Host from "./routes/Host.tsx";
import Resume from "./routes/Resume.tsx";
import Test from "./routes/Test.tsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<Host />} />
      <Route path="/guest" element={<Guest />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}
