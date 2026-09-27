import { useWebSocket } from "../hooks/useWebSocket";
import Header from "../components/Header";
import InterestInput from "../components/InterestInput";
import LinkedGraph from "../components/LinkedGraph";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Answers({
  code,
  name,
  onHome,
}: {
  code: string;
  name: string;
  onHome?: () => void;
}) {
  const { answers, links, sendMessage } = useWebSocket(code);
  const own = answers.find((res) => res.name === name);
  const interests = own?.interests ?? [];

  return (
    <div className="flex h-dvh w-full flex-col gap-4 p-4">
      <Header
        onHome={onHome}
        interests={interests}
        onRemove={(index) =>
          sendMessage(name, interests.filter((_, i) => i !== index))
        }
      />
      <LinkedGraph answers={answers} links={links} own={name} />
      <Card size="sm" className="mx-auto w-full max-w-sm">
        <CardContent>
          <Label htmlFor="interests" className="sr-only">
            Add an interest
          </Label>
          <InterestInput
            onAdd={(interest) => sendMessage(name, [...interests, interest])}
          />
        </CardContent>
      </Card>
    </div>
  );
}
