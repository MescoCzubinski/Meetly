import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { List, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Header({
  favicon,
  onHome,
  interests,
  onRemove,
}: {
  favicon: string;
  onHome?: () => void;
  interests?: string[];
  onRemove?: (index: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const list = (
    <div className="flex flex-wrap gap-2">
      {interests?.map((interest, index) => (
        <Badge key={index} variant="neutral" className="text-base">
          {interest}
          <button
            type="button"
            className="cursor-pointer"
            aria-label={`Remove ${interest}`}
            onClick={() => onRemove?.(index)}
          >
            <X />
          </button>
        </Badge>
      ))}
    </div>
  );

  return (
    <header className="pointer-events-none fixed inset-x-4 top-4 z-10 flex items-start justify-between [&>*]:pointer-events-auto">
      <button
        type="button"
        className={`flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 shadow-shadow ${onHome ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => onHome && setConfirming(true)}
      >
        <img src={favicon} alt="" className="size-8" />
        <span className="text-2xl font-heading">Meetly</span>
      </button>
      {interests && (
        <>
          <Card
            size="sm"
            className="hidden max-h-[calc(100dvh-2rem)] w-72 overflow-y-auto md:flex"
          >
            <CardHeader>
              <CardTitle className="text-xl">Your interests</CardTitle>
            </CardHeader>
            <CardContent>{list}</CardContent>
          </Card>
          <Dialog.Root>
            <Dialog.Trigger
              render={
                <Button
                  variant="neutral"
                  aria-label="Your interests"
                  className="size-13 md:hidden [&_svg]:size-6"
                />
              }
            >
              <List />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/50" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
                <Card size="sm" className="max-h-[80dvh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>
                      <Dialog.Title className="text-xl">
                        Your interests
                      </Dialog.Title>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{list}</CardContent>
                </Card>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      )}
      <Dialog.Root open={confirming} onOpenChange={setConfirming}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/50" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Dialog.Title className="text-2xl">Leave?</Dialog.Title>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog.Description>
                  You will go back to the main page.
                </Dialog.Description>
              </CardContent>
              <CardFooter className="gap-4">
                <Dialog.Close
                  render={<Button variant="neutral" className="flex-1" />}
                >
                  Stay
                </Dialog.Close>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setConfirming(false);
                    onHome?.();
                  }}
                >
                  Leave
                </Button>
              </CardFooter>
            </Card>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
