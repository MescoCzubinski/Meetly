export const copyInviteLink = (
  code: string,
  setCopied: (copied: boolean) => void,
) => {
  const link = `${import.meta.env.VITE_URL}?code=${code}`;
  navigator.clipboard?.writeText(link).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  });
};
