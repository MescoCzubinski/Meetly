import { useState } from "react";
import { Check, Link, Mail, Share2 } from "lucide-react";
import { copyText } from "@/utils/copyInviteLink";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import discord from "@/assets/discord.svg";
import whatsapp from "@/assets/whatsapp.svg";

const TEXT = "Join my Meetly session";

export default function ShareMenu({
  link,
  disabled,
}: {
  link: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(TEXT);
  const url = encodeURIComponent(link);

  const copy = () =>
    copyText(link, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    });

  const external = (href: string) => (
    <a href={href} target="_blank" rel="noreferrer" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            variant="neutral"
            aria-label="Share invitation link"
            className="h-14 w-14 data-popup-open:translate-x-boxShadowX data-popup-open:translate-y-boxShadowY data-popup-open:shadow-none [&_svg]:size-7"
          />
        }
      >
        {copied ? <Check /> : <Share2 />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="shadow-shadow">
        <DropdownMenuItem className="text-lg" onClick={copy}>
          <Link />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-lg"
          onClick={copy}
          render={external("https://discord.com/channels/@me")}
        >
          <img src={discord} alt="" className="size-4" />
          Discord
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-lg"
          render={external(`https://wa.me/?text=${text}%20${url}`)}
        >
          <img src={whatsapp} alt="" className="size-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-lg"
          render={external(`mailto:?subject=${text}&body=${url}`)}
        >
          <Mail />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
