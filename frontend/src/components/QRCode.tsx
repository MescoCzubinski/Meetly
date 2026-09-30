import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { copyText, inviteLink } from "@/utils/copyInviteLink";
import ShareMenu from "@/components/ShareMenu";
import { Button } from "@/components/ui/button";

const randomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const scramble = () => ({
  code: randomCode(),
  qr: Array.from({ length: inviteLink(randomCode()).length }, () =>
    String.fromCharCode(33 + Math.floor(Math.random() * 94)),
  ).join(""),
});

export default function QRCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [scrambled, setScrambled] = useState(scramble);

  useEffect(() => {
    if (code) return;
    const interval = setInterval(() => setScrambled(scramble()), 100);
    return () => clearInterval(interval);
  }, [code]);

  const copyCode = () =>
    copyText(code, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex gap-4">
        <Button
          aria-label="Copy session code"
          className="h-14 flex-1 cursor-copy text-2xl font-heading disabled:opacity-100 data-disabled:opacity-100"
          disabled={!code}
          onClick={copyCode}
        >
          {copied ? "Copied!" : code || scrambled.code}
        </Button>
        <ShareMenu link={inviteLink(code)} disabled={!code} />
      </div>
      <div className="rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow">
        <QRCodeCanvas
          value={code ? inviteLink(code) : scrambled.qr}
          size={1024}
          bgColor="transparent"
          fgColor="#000000"
          level="H"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
