import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import Name from "@/components/Name";
import InterestInput from "@/components/InterestInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const EXAMPLES = [
  "Volleyball",
  "Gym",
  "Hiking",
  "Cooking",
  "Travel",
  "Board games",
];

export default function Profile({
  code,
  onDone,
}: {
  code: string;
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const { sendMessage } = useWebSocket(code);

  const [badgesHeight, setBadgesHeight] = useState<number>();
  const measureBadges = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new ResizeObserver(() => setBadgesHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!name) return <Name onSubmit={setName} />;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Label htmlFor="interests" className="text-2xl">
            Enter your interests:
          </Label>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InterestInput
          autoFocus
          onAdd={(interest) => {
            const lower = interest.toLowerCase();
            const existing = interests.find((i) => i.toLowerCase() === lower);
            if (existing) {
              toast.add({
                type: "error",
                title: "Already added",
                description: `"${existing}" is already on your list`,
              });
              return;
            }
            setInterests([...interests, interest]);
          }}
        />
        <div
          style={{ height: badgesHeight }}
          className="overflow-hidden transition-[height] duration-300"
        >
          <div ref={measureBadges} className="flex flex-wrap gap-2">
            {interests.length > 0 ? (
              interests.map((interest, index) => (
                <Badge key={index} variant="neutral" className="text-base">
                  {interest}
                  <button
                    type="button"
                    className="cursor-pointer"
                    aria-label={`Remove ${interest}`}
                    onClick={() =>
                      setInterests(interests.filter((_, i) => i !== index))
                    }
                  >
                    <X />
                  </button>
                </Badge>
              ))
            ) : (
              <>
                <span className="text-lg">E.g.</span>
                {EXAMPLES.map((example) => (
                  <Badge key={example} variant="neutral" className="text-base">
                    {example}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          size="lg"
          className="w-full text-lg"
          disabled={interests.length === 0}
          onClick={() => {
            sendMessage(name, interests);
            onDone(name);
          }}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}
