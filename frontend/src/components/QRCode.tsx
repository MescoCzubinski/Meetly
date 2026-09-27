import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { copyInviteLink } from "../utils/copyInviteLink";
import { Button } from "@/components/ui/button";

const link = (url: string, code: string) => url + "?code=" + code;
const randomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const scramble = (url: string) => ({
  code: randomCode(),
  qr: Array.from({ length: link(url, randomCode()).length }, () =>
    String.fromCharCode(33 + Math.floor(Math.random() * 94)),
  ).join(""),
});

export default function QRCode({ url, code }: { url: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [scrambled, setScrambled] = useState(() => scramble(url));

  useEffect(() => {
    if (code) return;
    const interval = setInterval(() => setScrambled(scramble(url)), 100);
    return () => clearInterval(interval);
  }, [code, url]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        aria-label="Copy invitation link"
        className="h-14 w-full text-2xl font-heading disabled:opacity-100 data-disabled:opacity-100"
        disabled={!code}
        onClick={() => copyInviteLink(code, setCopied)}
      >
        {copied ? "Copied!" : code || scrambled.code}
      </Button>
      <div className="rounded-base border-2 border-border bg-secondary-background shadow-shadow p-4">
        <QRCodeCanvas
          value={code ? link(url, code) : scrambled.qr}
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
