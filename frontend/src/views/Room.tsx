import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import InterestInput from "@/components/InterestInput";
import LinkedGraph from "@/components/LinkedGraph";
import ChatModal from "@/components/modals/ChatModal";
import Modal from "@/components/modals/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Room({
  code,
  name,
  token,
  onHome,
}: {
  code: string;
  name: string;
  token: string;
  onHome: () => void;
}) {
  const { answers, links, ended, sendInterests } = useWebSocket(code, token);
  const own = answers.find((res) => res.name === name);
  const interests = own?.interests ?? [];
  const { messages, sendMessage } = useMessages(token);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const openChat = (person: string | null) => {
    setChatWith(person);
    setChatOpen(true);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <LinkedGraph
        answers={answers}
        links={links}
        own={name}
        onSelect={(person) => person !== name && openChat(person)}
      />
      <div className="mx-auto flex w-full max-w-sm items-end gap-4">
        <Button
          variant="neutral"
          aria-label="Open chats"
          className="size-13 shrink-0 md:fixed md:bottom-4 md:left-4 md:z-10 [&_svg]:size-6"
          onClick={() => openChat(null)}
        >
          <MessageCircle />
        </Button>
        <Card size="sm" className="w-full min-w-0">
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
                        sendInterests(interests.filter((_, i) => i !== index))
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
              onAdd={(interest) => sendInterests([...interests, interest])}
            />
          </CardContent>
        </Card>
      </div>
      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        own={name}
        people={answers.map((a) => a.name).filter((n) => n !== name)}
        selected={chatWith}
        onSelect={setChatWith}
        messages={messages}
        onSend={sendMessage}
      />
      <Modal
        open={ended}
        onOpenChange={(open) => !open && onHome()}
        title="Session ended"
        footer={
          <Button size="lg" className="w-full text-lg" onClick={onHome}>
            Go to main page
          </Button>
        }
      >
        <p>This session is over. Thanks for joining!</p>
      </Modal>
    </div>
  );
}
