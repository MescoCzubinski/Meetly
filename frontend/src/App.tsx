import { useEffect, useState, type ReactNode } from "react";
import Home from "./views/Home.tsx";
import Guest from "./views/Guest.tsx";
import Host from "./views/Host.tsx";
import Answers from "./views/Answers.tsx";
import Header from "./components/Header.tsx";
import { loadSessions, saveSession, type Session } from "./storage.ts";

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

  useEffect(() => window.history.replaceState(state, ""), [state]);

  useEffect(() => {
    if (state.view !== "answers") return;
    const { code, name, guest } = state;
    setSessions(saveSession({ code, name, guest }));
  }, [state]);

  const isGuest =
    state.view === "guest" || (state.view === "answers" && state.guest);
  const favicon = isGuest ? "/favicon-card.ico" : "/favicon-main.ico";
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = favicon;
  }, [favicon]);

  const goHome =
    state.view === "home" ? undefined : () => setState({ view: "home" });

  let view: ReactNode;
  switch (state.view) {
    case "home":
      view = (
        <Home
          onHost={() => setState({ view: "host" })}
          onJoin={(code) => setState({ view: "guest", code })}
          sessions={sessions}
          onResume={(session) => setState({ view: "answers", ...session })}
        />
      );
      break;
    case "host":
      view = (
        <Host
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
          favicon={favicon}
          onHome={goHome}
        />
      );
      break;
  }

  return (
    <>
      {state.view !== "answers" && (
        <Header favicon={favicon} onHome={goHome} />
      )}
      {view}
    </>
  );
}
