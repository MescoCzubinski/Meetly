import { useWebSocket } from "../hooks/useWebSocket";
import InterestInput from "../components/InterestInput";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Answers({
  code,
  name,
}: {
  code: string;
  name: string;
}) {
  const { answers, sendMessage } = useWebSocket(code);
  const own = answers.find((res) => res.name === name);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-sm flex-col gap-4 p-4">
      <div className="-mr-1 flex flex-1 flex-col gap-4 overflow-y-auto pr-1 pb-1 scrollbar-hidden">
        {answers.map((res) => (
          <Card
            key={res.name}
            size="sm"
            className={`animate-in fade-in zoom-in-90 slide-in-from-bottom-4 duration-300 ${res === own ? "order-first bg-main" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-xl">{res.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {res.interests.map((interest, i) => (
                <Badge key={i} variant="neutral" className="text-base">
                  {interest}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card size="sm">
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
