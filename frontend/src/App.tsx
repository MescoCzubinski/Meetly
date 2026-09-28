import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import Home from "@/views/Home";
import JoinSession from "@/views/JoinSession";
import CreateSession from "@/views/CreateSession";
import Room from "@/views/Room";
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
  | { view: "create" }
  | { view: "join"; code: string; guest: boolean }
  | {
      view: "room";
      code: string;
      name: string;
      guest: boolean;
      token: string;
    };

const initialState = ((): State => {
  const code = new URLSearchParams(window.location.search).get("code");
  if (code !== null) {
    window.history.replaceState(null, "", "/");
    return { view: "join", code, guest: true };
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
  const [joinedCode, setJoinedCode] = useState("");

  useEffect(() => window.history.replaceState(state, ""), [state]);

  useEffect(() => {
    if (state.view !== "room") return;
    const { code, name, guest, token } = state;
    setSessions(saveSession({ code, name, guest, token }));
  }, [state]);

  const goHome =
    state.view === "home" ? undefined : () => setState({ view: "home" });

  const headerCode =
    state.view === "room" ||
    (state.view === "join" && state.code === joinedCode)
      ? state.code
      : undefined;

  let view: ReactNode;
  switch (state.view) {
    case "home":
      view = (
        <Home
          onHost={() => setState({ view: "create" })}
          onJoin={(code) => setState({ view: "join", code, guest: true })}
          sessions={sessions}
          onResume={(session) => setState({ view: "room", ...session })}
          onEnded={removeEnded}
        />
      );
      break;
    case "create":
      view = (
        <CreateSession
          onDone={(code) => setState({ view: "join", code, guest: false })}
        />
      );
      break;
    case "join":
      view = (
        <JoinSession
          code={state.code}
          onCode={setJoinedCode}
          onDone={(name, token) =>
            setState({
              view: "room",
              code: state.code,
              name,
              guest: state.guest,
              token,
            })
          }
          onHome={() => setState({ view: "home" })}
        />
      );
      break;
    case "room":
      view = (
        <Room
          code={state.code}
          name={state.name}
          token={state.token}
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
            (state.view === "join" || state.view === "room") && !state.guest
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
