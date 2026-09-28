import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { isValidCode } from "@/lib/api";
import Home from "@/views/Home";
import Guest from "@/views/Guest";
import Host from "@/views/Host";
import Answers from "@/views/Answers";
import Background from "@/components/Background";
import Header from "@/components/Header";
import AboutModal from "@/components/modals/AboutModal";
import { Button } from "@/components/ui/button";
import {
  loadSessions,
  removeSessions,
  saveSession,
  type Session,
} from "@/lib/storage";

type State =
  | { view: "home" }
  | { view: "host" }
  | { view: "guest"; code: string }
  | { view: "answers"; code: string; name: string; guest: boolean };

const initialState = ((): State => {
  const code = new URLSearchParams(window.location.search).get("code");
  if (code !== null) {
    window.history.replaceState(null, "", "/");
    return { view: "guest", code };
  }
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navigation?.type === "reload";
  return isReload && window.history.state?.view
    ? window.history.state
    : { view: "home" };
})();

export default function App() {
  const [state, setState] = useState<State>(initialState);

  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const removeEnded = useCallback(
    (codes: string[]) => setSessions(removeSessions(codes)),
    [],
  );
  const [showingAbout, setShowingAbout] = useState(false);
  const [hostCode, setHostCode] = useState("");

  useEffect(() => window.history.replaceState(state, ""), [state]);

  useEffect(() => {
    if (state.view !== "answers") return;
    const { code, name, guest } = state;
    setSessions(saveSession({ code, name, guest }));
  }, [state]);

  const goHome =
    state.view === "home" ? undefined : () => setState({ view: "home" });

  const headerCode =
    state.view === "host"
      ? hostCode
      : state.view === "answers" ||
          (state.view === "guest" && isValidCode(state.code))
        ? state.code
        : undefined;

  let view: ReactNode;
  switch (state.view) {
    case "home":
      view = (
        <Home
          onHost={() => {
            setHostCode("");
            setState({ view: "host" });
          }}
          onJoin={(code) => setState({ view: "guest", code })}
          sessions={sessions}
          onResume={(session) => setState({ view: "answers", ...session })}
          onEnded={removeEnded}
        />
      );
      break;
    case "host":
      view = (
        <Host
          onCode={setHostCode}
          onDone={(code, name) =>
            setState({ view: "answers", code, name, guest: false })
          }
        />
      );
      break;
    case "guest":
      view = (
        <Guest
          code={state.code}
          onDone={(name) =>
            setState({ view: "answers", code: state.code, name, guest: true })
          }
          onHome={() => setState({ view: "home" })}
        />
      );
      break;
    case "answers":
      view = (
        <Answers
          code={state.code}
          name={state.name}
          onHome={() => setState({ view: "home" })}
        />
      );
      break;
  }

  return (
    <>
      <Background />
      <div className="flex min-h-dvh flex-col gap-4 p-4">
        <Header
          onHome={goHome}
          onAbout={() => setShowingAbout(true)}
          code={headerCode}
          host={
            state.view === "host" || (state.view === "answers" && !state.guest)
          }
        />
        {view}
      </div>
      <Button
        variant="neutral"
        aria-label="About Meetly"
        className="fixed right-4 bottom-4 z-10 hidden size-13 md:inline-flex [&_svg]:size-6"
        onClick={() => setShowingAbout(true)}
      >
        <Info />
      </Button>
      <AboutModal open={showingAbout} onOpenChange={setShowingAbout} />
    </>
  );
}
