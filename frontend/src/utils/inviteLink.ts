import { APP_URL } from "@/lib/config";

export const inviteLink = (code: string) => `${APP_URL}?code=${code}`;
