import { APP_URL } from "@/lib/config";

export const inviteLink = (code: string) => `${APP_URL}?code=${code}`;

export const copyInviteLink = (
  code: string,
  setCopied: (copied: boolean) => void,
) => {
  navigator.clipboard?.writeText(inviteLink(code)).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  });
};
