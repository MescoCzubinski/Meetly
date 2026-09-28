import { useState } from "react";
import { Info, LogOut, Menu, QrCode } from "lucide-react";
import { endSession } from "@/lib/api";
import { loadHostToken } from "@/lib/storage";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ShareModal from "@/components/modals/ShareModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GITHUB_URL } from "@/lib/config";
import github from "@/assets/github.svg";

const large = "h-auto px-4 py-2 text-2xl font-heading";
const icon = "h-auto p-2 [&_svg]:size-8";

export default function Header({
  onHome,
  onAbout,
  code,
  host,
}: {
  onHome?: () => void;
  onAbout: () => void;
  code?: string;
  host?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [ending, setEnding] = useState(false);
  const leave = () => (host ? setEnding(true) : setConfirming(true));
  const leaveLabel = host ? "End session" : "Leave";

  return (
    <header className="flex items-start justify-between">
      <Button
        variant="neutral"
        disabled={!onHome}
        className={`${large} disabled:opacity-100 data-disabled:opacity-100`}
        onClick={() => setConfirming(true)}
      >
        <img src="/icon.png" alt="" className="size-8" />
        Meetly
      </Button>
      <div className="flex gap-2">
        {code && (
          <>
            <Button
              variant="neutral"
              aria-label="Show invitation QR code"
              className={icon}
              onClick={() => setSharing(true)}
            >
              <QrCode />
            </Button>
            {onHome && (
              <Button
                className={`${large} hidden md:inline-flex`}
                onClick={leave}
              >
                {leaveLabel}
              </Button>
            )}
          </>
        )}
        <Button
          variant="neutral"
          aria-label="Meetly on GitHub"
          className={`${icon} hidden md:inline-flex`}
          nativeButton={false}
          render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
        >
          <img src={github} alt="" className="size-8" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="neutral"
                aria-label="Open menu"
                className={`${icon} md:hidden`}
              />
            }
          >
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="shadow-shadow"
          >
            {code && onHome && (
              <DropdownMenuItem className="text-lg" onClick={leave}>
                <LogOut />
                {leaveLabel}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-lg" onClick={onAbout}>
              <Info />
              About
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-lg"
              render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            >
              <img src={github} alt="" className="size-4" />
              GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
