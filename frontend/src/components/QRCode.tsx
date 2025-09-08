import { QRCodeCanvas } from "qrcode.react";

export default function QRCode({ url, code }: { url: string; code: string }) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-light")
    .trim();

  return (
    <div className="flex w-full justify-center flex-col gap-y-4">
      <div className="border-2 border-[var(--color-light)] rounded-md text-[var(--color-light)] h-12 cursor-pointer text-2xl flex items-center justify-center">
        {code}
      </div>
      <QRCodeCanvas
        value={url + "?code=" + code}
        size={1024}
        bgColor="transparent"
        fgColor={color}
        level="H"
        className="rounded-md"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
