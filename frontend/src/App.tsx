import { useEffect, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import Home from "@/views/Home";
import Guest from "@/views/Guest";
import Host from "@/views/Host";
import Answers from "@/views/Answers";
import Header from "@/components/Header";
import AboutModal from "@/components/modals/AboutModal";
import { Button } from "@/components/ui/button";
import { loadSessions, saveSession, type Session } from "@/storage";

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
          (state.view === "guest" && /^\d{6}$/.test(state.code))
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
        <Answers code={state.code} name={state.name} />
      );
      break;
  }

  return (
    <>
      <div className="flex min-h-dvh flex-col gap-4 p-4">
        <Header onHome={goHome} code={headerCode} />
        {view}
      </div>
      <Button
        variant="neutral"
        aria-label="About Meetly"
        className="fixed right-4 bottom-4 z-10 size-13 [&_svg]:size-6"
        onClick={() => setShowingAbout(true)}
      >
        <Info />
      </Button>
      <AboutModal open={showingAbout} onOpenChange={setShowingAbout} />
    </>
  );
}
