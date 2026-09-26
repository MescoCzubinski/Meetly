import { useWebSocket } from "../hooks/useWebSocket";
import InterestInput from "../components/InterestInput";
import LinkedGraph from "../components/LinkedGraph";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Answers({
  code,
  name,
}: {
  code: string;
  name: string;
}) {
  const { answers, links, sendMessage } = useWebSocket(code);
  const own = answers.find((res) => res.name === name);

  return (
    <div className="flex h-dvh w-full flex-col gap-4 p-4">
      <LinkedGraph answers={answers} links={links} own={name} />
      <Card size="sm" className="mx-auto w-full max-w-sm">
        <CardContent>
          <Label htmlFor="interests" className="sr-only">
            Add an interest
          </Label>
          <InterestInput
            onAdd={(interest) =>
              sendMessage(name, [...(own?.interests ?? []), interest])
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
