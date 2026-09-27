import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { copyInviteLink, inviteLink } from "@/utils/copyInviteLink";

export default function ShareModal({
  open,
  onOpenChange,
  code,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}) {
  const [codeCopied, setCodeCopied] = useState(false);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Invite">
      <div className="flex flex-col gap-4">
        <Button
          aria-label="Copy invitation link"
          className="h-14 w-full cursor-copy text-2xl font-heading"
          onClick={() => copyInviteLink(code, setCodeCopied)}
        >
          {codeCopied ? "Copied!" : code}
        </Button>
        <div className="rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow">
          <QRCodeCanvas
            value={inviteLink(code)}
            size={1024}
            bgColor="transparent"
            fgColor="#000000"
            level="H"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </Modal>
  );
}
