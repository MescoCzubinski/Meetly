import { APP_URL } from "@/lib/config";

export const inviteLink = (code: string) => `${APP_URL}?code=${code}`;

const copyText = (
  text: string,
  setCopied: (copied: boolean) => void,
) => {
  navigator.clipboard?.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  });
};

export const copyInviteLink = (
  code: string,
  setCopied: (copied: boolean) => void,
) => copyText(inviteLink(code), setCopied);
