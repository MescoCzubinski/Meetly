import { useState } from "react";
import { QrCode } from "lucide-react";
import { API_URL } from "@/api";
import { loadHostToken } from "@/storage";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ShareModal from "@/components/modals/ShareModal";
import { copyInviteLink } from "@/utils/copyInviteLink";

const pressable =
  "transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none";

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
      <button
        type="button"
        className={`flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 shadow-shadow ${onHome ? pressable : "cursor-default"}`}
        onClick={() => onHome && setConfirming(true)}
      >
        <img src="/favicon-main.ico" alt="" className="size-8" />
        <span className="text-2xl font-heading">Meetly</span>
      </button>
      {code && (
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Show invitation QR code"
            className={`${pressable} rounded-base border-2 border-border bg-secondary-background px-2 py-2 shadow-shadow [&_svg]:size-8`}
            onClick={() => setSharing(true)}
          >
            <QrCode />
          </button>
          <button
            type="button"
            aria-label="Copy invitation link"
            className={`${pressable} cursor-copy rounded-base border-2 border-border bg-secondary-background px-4 py-2 text-2xl font-heading shadow-shadow`}
            onClick={() => copyInviteLink(code, setCopied)}
          >
            {copied ? "Copied!" : code}
          </button>
          {onHome && (
            <button
              type="button"
              className={`${pressable} rounded-base border-2 border-border bg-main px-4 py-2 text-2xl font-heading text-main-foreground shadow-shadow`}
              onClick={() => (host ? setEnding(true) : setConfirming(true))}
            >
              {host ? "End session" : "Leave"}
            </button>
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
            await fetch(`${API_URL}/sessions/${code}`, {
              method: "DELETE",
              headers: { "X-Host-Token": loadHostToken(code) ?? "" },
            }).catch(() => {});
            onHome();
          }}
        />
      )}
    </header>
  );
}
