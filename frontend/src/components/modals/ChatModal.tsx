import { ArrowLeft, MessageCircle } from "lucide-react";
import type { ChatMessage } from "@/hooks/useMessages";
import Chat from "@/components/Chat";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

export default function ChatModal({
  open,
  onOpenChange,
  own,
  people,
  selected,
  onSelect,
  messages,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  own: string;
  people: string[];
  selected: string | null;
  onSelect: (person: string | null) => void;
  messages: ChatMessage[];
  onSend: (to: string, text: string) => void;
}) {
  const lastMessage = (person: string) =>
    messages
      .filter(
        (m) =>
          (m.from === own && m.to === person) ||
          (m.from === person && m.to === own),
      )
      .at(-1);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        selected ? (
          <span className="flex items-center gap-3">
            <Button
              variant="neutral"
              size="icon-sm"
              aria-label="Back to chats"
              onClick={() => onSelect(null)}
            >
              <ArrowLeft />
            </Button>
            <Card className="h-9 justify-center bg-secondary-background px-3 py-0 text-lg">
              {selected}
            </Card>
          </span>
        ) : (
          "Chats"
        )
      }
    >
      {selected ? (
        <Chat
          key={selected}
          own={own}
          other={selected}
          messages={messages}
          onSend={(text) => onSend(selected, text)}
        />
      ) : people.length === 0 ? (
        <p>Nobody else is here yet.</p>
      ) : (
        <ItemGroup>
          {people.map((person) => (
            <Item
              key={person}
              render={<button type="button" onClick={() => onSelect(person)} />}
            >
              <ItemContent>
                <ItemTitle>{person}</ItemTitle>
                <ItemDescription className="line-clamp-1">
                  {lastMessage(person)?.text ?? "No messages yet"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <MessageCircle />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </Modal>
  );
}
