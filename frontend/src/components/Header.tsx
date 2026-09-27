import { useState } from "react";
import { QrCode } from "lucide-react";
import { endSession } from "@/lib/api";
import { loadHostToken } from "@/lib/storage";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ShareModal from "@/components/modals/ShareModal";
import { Button } from "@/components/ui/button";
import { copyInviteLink } from "@/utils/copyInviteLink";

const large = "h-auto px-4 py-2 text-2xl font-heading";

export default function Header({
  onHome,
  code,
  host,
}: {
  onHome?: () => void;
  code?: string;
  host?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [ending, setEnding] = useState(false);

  return (
    <header className="flex items-start justify-between">
      <Button
        variant="neutral"
        disabled={!onHome}
        className={`${large} disabled:opacity-100 data-disabled:opacity-100`}
        onClick={() => setConfirming(true)}
      >
        <img src="/favicon-main.ico" alt="" className="size-8" />
        Meetly
      </Button>
      {code && (
        <div className="flex gap-2">
          <Button
            variant="neutral"
            aria-label="Show invitation QR code"
            className="h-auto p-2 [&_svg]:size-8"
            onClick={() => setSharing(true)}
          >
            <QrCode />
          </Button>
          <Button
            variant="neutral"
            aria-label="Copy invitation link"
            className={`${large} cursor-copy`}
            onClick={() => copyInviteLink(code, setCopied)}
          >
            {copied ? "Copied!" : code}
          </Button>
          {onHome && (
            <Button
              className={large}
              onClick={() => (host ? setEnding(true) : setConfirming(true))}
            >
              {host ? "End session" : "Leave"}
            </Button>
          )}
        </div>
      )}
      {code && (
        <ShareModal open={sharing} onOpenChange={setSharing} code={code} />
      )}
      {onHome && (
        <ConfirmModal
          open={confirming}
          onOpenChange={setConfirming}
          onConfirm={onHome}
        />
      )}
      {onHome && code && host && (
        <ConfirmModal
          open={ending}
          onOpenChange={setEnding}
          title="End session?"
          description="The session will end for everyone and all cards will be removed."
          confirmLabel="End session"
          onConfirm={async () => {
            await endSession(code, loadHostToken(code) ?? "");
            onHome();
          }}
        />
      )}
    </header>
  );
}
