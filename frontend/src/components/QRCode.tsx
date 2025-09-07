import { QRCodeCanvas } from "qrcode.react";

export default function QRCode({ url }: { url: string }) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-light")
    .trim();

  return (
    <div className="flex w-full justify-center">
      <QRCodeCanvas
        value={url}
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
