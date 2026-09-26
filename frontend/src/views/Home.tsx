import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Container from "../components/Container";
import InputWithButton from "../components/InputWithButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home({
  onHost,
  onJoin,
}: {
  onHost: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState<string>("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!showError) return;
    const timer = setTimeout(() => setShowError(false), 1300);
    return () => clearTimeout(timer);
  }, [showError]);

  return (
    <Container>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl leading-tight">
              Hi, I'm Meetly! Do you want to get somebody know?
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" className="w-full text-lg" onClick={onHost}>
            Click to be a Host
          </Button>
          <InputWithButton
            aria-label="input code"
            inputMode="numeric"
            placeholder="Or enter the code here"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onSubmit={() => {
              if (code.length === 6) {
                onJoin(code);
              } else {
                setShowError(true);
              }
            }}
            button={<ArrowRight />}
            buttonLabel="Join"
          />
          <div
            aria-hidden={!showError}
            className={`-mt-4 grid transition-[grid-template-rows] duration-300 ${showError ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <p className="pt-4 w-full text-center">
                code is 6 characters long
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
