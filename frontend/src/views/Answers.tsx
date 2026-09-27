import { X } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import InterestInput from "@/components/InterestInput";
import LinkedGraph from "@/components/LinkedGraph";
import { Badge } from "@/components/ui/badge";
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
  const interests = own?.interests ?? [];

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <LinkedGraph answers={answers} links={links} own={name} />
      <Card size="sm" className="mx-auto w-full max-w-sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <Badge key={index} variant="neutral" className="text-base">
                {interest}
                {interests.length > 1 && (
                  <button
                    type="button"
                    className="cursor-pointer"
                    aria-label={`Remove ${interest}`}
                    onClick={() =>
                      sendMessage(name, interests.filter((_, i) => i !== index))
                    }
                  >
                    <X />
                  </button>
                )}
              </Badge>
            ))}
          </div>
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
