const required = (name: string, value: string | undefined): string => {
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

export const API_URL = `${required("VITE_API_URL", import.meta.env.VITE_API_URL)}/api`;
export const WS_URL = API_URL.replace(/^http/, "ws");
export const APP_URL = required("VITE_URL", import.meta.env.VITE_URL);

export const GITHUB_URL = "https://github.com/MescoCzubinski/Meetly";
export const MODEL_URL =
  "https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2";
