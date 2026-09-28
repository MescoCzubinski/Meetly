import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/hooks/useMessages";
import InputWithButton from "@/components/InputWithButton";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller";

type ChatProps = {
  own: string;
  other: string;
  messages: ChatMessage[];
  onSend: (text: string) => void;
};

export default function Chat(props: ChatProps) {
  return (
    <MessageScrollerProvider>
      <ChatBody {...props} />
    </MessageScrollerProvider>
  );
}

function ChatBody({ own, other, messages, onSend }: ChatProps) {
  const { scrollToEnd } = useMessageScroller();
  const { end: canScrollDown } = useMessageScrollerScrollable();
  const MAX_MESSAGE_LENGTH = 500;

  const [value, setValue] = useState("");
  const conversation = messages.filter(
    (m) =>
      (m.from === own && m.to === other) || (m.from === other && m.to === own),
  );

  const wasAtEnd = useRef(true);
  const count = useRef(conversation.length);
  useEffect(() => {
    const last = conversation.at(-1);
    const added = conversation.length > count.current;
    count.current = conversation.length;
    if (added && (last?.from === own || wasAtEnd.current))
      scrollToEnd({ behavior: "smooth" });
  }, [conversation, own, scrollToEnd]);
  useEffect(() => {
    wasAtEnd.current = !canScrollDown;
  }, [canScrollDown]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[50dvh] flex-col overflow-hidden rounded-base border-2 border-border bg-secondary-background text-foreground">
        <MessageScroller className="p-4">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4">
              {conversation.map((message, index) => (
                <MessageScrollerItem key={index} messageId={`message-${index}`}>
                  <Message align={message.from === own ? "end" : "start"}>
                    <MessageContent>
                      <Bubble
                        variant={message.from === own ? "default" : "muted"}
                      >
                        <BubbleContent>{message.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton className="start-1/2" />
        </MessageScroller>
      </div>
      <InputWithButton
        placeholder={`Message ${other}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={(text) => {
          onSend(text);
          setValue("");
        }}
        maxLength={MAX_MESSAGE_LENGTH}
        button={<SendHorizontal />}
        buttonLabel="Send message"
      />
    </div>
  );
}
