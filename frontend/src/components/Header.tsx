import { useState } from "react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { copyInviteLink } from "@/utils/copyInviteLink";

export default function Header({
  onHome,
  code,
}: {
  onHome?: () => void;
  code?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-4 top-4 z-10 flex items-start justify-between [&>*]:pointer-events-auto">
      <button
        type="button"
        className={`flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 shadow-shadow ${onHome ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => onHome && setConfirming(true)}
      >
        <img src="/favicon-main.ico" alt="" className="size-8" />
        <span className="text-2xl font-heading">Meetly</span>
      </button>
      {code && (
        <button
          type="button"
          aria-label="Copy invitation link"
          className="cursor-pointer rounded-base border-2 border-border bg-secondary-background px-4 py-2 text-2xl font-heading shadow-shadow"
          onClick={() => copyInviteLink(code, setCopied)}
        >
          {copied ? "Copied!" : code}
        </button>
      )}
      {onHome && (
        <ConfirmModal
          open={confirming}
          onOpenChange={setConfirming}
          onConfirm={onHome}
        />
      )}
    </header>
  );
}
