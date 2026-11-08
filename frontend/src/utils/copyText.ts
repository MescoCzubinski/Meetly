export const copyText = (text: string, onCopied: () => void) => {
  navigator.clipboard?.writeText(text).then(onCopied);
};
