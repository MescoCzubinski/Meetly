import { useEffect, useState } from "react";
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
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = isGuest ? "/favicon-card.ico" : "/favicon-main.ico";
  }, [isGuest]);

  switch (state.view) {
    case "home":
      return (
        <Home
          onHost={() => setState({ view: "host" })}
          onJoin={(code) => setState({ view: "guest", code })}
        />
      );
    case "host":
      return (
        <Host
          onDone={(code, name) =>
            setState({ view: "answers", code, name, guest: false })
          }
        />
      );
    case "guest":
      return (
        <Guest
          code={state.code}
          onDone={(name) =>
            setState({ view: "answers", code: state.code, name, guest: true })
          }
          onHome={() => setState({ view: "home" })}
        />
      );
    case "answers":
      return <Answers code={state.code} name={state.name} />;
  }
}
