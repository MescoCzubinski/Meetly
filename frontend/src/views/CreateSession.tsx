import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "@/lib/api";
import { saveHostToken } from "@/lib/storage";
import { Container } from "@/components/Container";
import { QRCode } from "@/components/QRCode";
import { Button } from "@/components/ui/button";

const MIN_SCRAMBLE = 600; // ms, so the code animation is seen even on a fast API

export const CreateSession = ({
  onDone,
}: {
  onDone: (code: string) => void;
}) => {
  const { mutate, data } = useMutation({
    mutationFn: async () => {
      const [session] = await Promise.all([
        createSession(),
        new Promise((resolve) => setTimeout(resolve, MIN_SCRAMBLE)),
      ]);
      return session;
    },
    onSuccess: (session) => saveHostToken(session.code, session.hostToken),
    throwOnError: true,
  });
  const code = data?.code ?? "";

  useEffect(() => mutate(), [mutate]);

  return (
    <Container>
      <div className="flex w-full flex-col gap-6">
        <QRCode code={code} />
        <Button
          size="lg"
          className="h-12 w-full text-2xl font-heading"
          disabled={!code}
          onClick={() => onDone(code)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};
