import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useInterests } from "@/hooks/useInterests";
import { useSession } from "@/hooks/useSession";
import { joinSession } from "@/lib/api";
import { Name } from "@/components/Name";
import { InterestInput } from "@/components/InterestInput";
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

export const Profile = ({
  code,
  onDone,
}: {
  code: string;
  onDone: (name: string, token: string) => void;
}) => {
  const join = useMutation({
    mutationFn: (name: string) => joinSession(code, name),
    onError: () =>
      toast.add({
        type: "error",
        title: "Could not join",
        description: "Something went wrong, please try again",
      }),
  });
  const participant = join.data;
  const [interests, setInterests] = useState<string[]>([]);
  useSession(code, participant?.token, true);
  const { ready, sendInterests } = useInterests(participant?.token);

  const [badgesHeight, setBadgesHeight] = useState<number>();
  const measureBadges = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new ResizeObserver(() => setBadgesHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addInterest = (interest: string) =>
    setInterests([...interests, interest]);

  if (!participant)
    return <Name onSubmit={join.mutate} pending={join.isPending} />;

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
        <InterestInput autoFocus interests={interests} onAdd={addInterest} />
        <div
          style={{ height: badgesHeight }}
          className="overflow-hidden transition-[height] duration-300"
        >
          <div ref={measureBadges} className="flex flex-wrap gap-2">
            {interests.length > 0 ? (
              interests.map((interest) => (
                <Badge key={interest} variant="neutral" className="text-base">
                  {interest}
                  <button
                    type="button"
                    className="cursor-pointer"
                    aria-label={`Remove ${interest}`}
                    onClick={() =>
                      setInterests(interests.filter((i) => i !== interest))
                    }
                  >
                    <X />
                  </button>
                </Badge>
              ))
            ) : (
              <>
                <span className="text-lg font-heading text-background [-webkit-text-stroke:var(--text-stroke)] [paint-order:stroke_fill]">
                  E.g.
                </span>
                {EXAMPLES.map((example) => (
                  <Badge
                    key={example}
                    variant="neutral"
                    className="cursor-pointer text-base"
                    render={<button type="button" />}
                    onClick={() => addInterest(example)}
                  >
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
          disabled={!ready || interests.length === 0}
          onClick={() => {
            sendInterests(interests);
            onDone(participant.name, participant.token);
          }}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};
