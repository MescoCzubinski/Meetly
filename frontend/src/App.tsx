import { useEffect, useState, type ReactNode } from "react";
import Home from "./views/Home.tsx";
import Guest from "./views/Guest.tsx";
import Host from "./views/Host.tsx";
import Answers from "./views/Answers.tsx";

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

  useEffect(() => window.history.replaceState(state, ""), [state]);

  const isGuest =
    state.view === "guest" || (state.view === "answers" && state.guest);
  const favicon = isGuest ? "/favicon-card.ico" : "/favicon-main.ico";
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = favicon;
  }, [favicon]);

  let view: ReactNode;
  switch (state.view) {
    case "home":
      view = (
        <Home
          onHost={() => setState({ view: "host" })}
          onJoin={(code) => setState({ view: "guest", code })}
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
      view = <Answers code={state.code} name={state.name} />;
      break;
  }

  return (
    <>
      <header className="fixed top-4 left-4 z-10 flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 shadow-shadow cursor-default">
        <img src={favicon} alt="" className="size-8" />
        <span className="text-2xl font-heading">Meetly</span>
      </header>
      {view}
    </>
  );
}
