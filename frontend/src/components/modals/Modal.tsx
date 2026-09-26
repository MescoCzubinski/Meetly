import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
          <Card className="max-h-[80dvh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                <Dialog.Title className="text-2xl">{title}</Dialog.Title>
              </CardTitle>
              <CardAction>
                <Dialog.Close
                  aria-label="Close"
                  className="cursor-pointer [&_svg]:size-6"
                >
                  <X />
                </Dialog.Close>
              </CardAction>
            </CardHeader>
            <CardContent>{children}</CardContent>
            {footer && <CardFooter className="gap-4">{footer}</CardFooter>}
          </Card>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
