import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";
import Name from "./Name";
import InterestInput from "./InterestInput";
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
  const [duplicate, setDuplicate] = useState("");
  const [showError, setShowError] = useState(false);
  const { sendMessage } = useWebSocket(code);

  useEffect(() => {
    if (!showError) return;
    const timer = setTimeout(() => setShowError(false), 1300);
    return () => clearTimeout(timer);
  }, [showError]);

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
              setDuplicate(existing);
              setShowError(true);
              return;
            }
            setShowError(false);
            setInterests([...interests, interest]);
          }}
        />
        <div
          aria-hidden={!showError}
          className={`-mt-4 grid transition-[grid-template-rows] duration-300 ${showError ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <p className="pt-4 w-full text-center">
              "{duplicate}" is already added
            </p>
          </div>
        </div>
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
