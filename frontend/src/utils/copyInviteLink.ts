import { APP_URL } from "@/lib/config";

export const inviteLink = (code: string) => `${APP_URL}?code=${code}`;

export const copyText = (text: string, onCopied: () => void) => {
  navigator.clipboard?.writeText(text).then(onCopied);
};
