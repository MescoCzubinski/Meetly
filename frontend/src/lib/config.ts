export const API_URL = import.meta.env.VITE_API_URL;
export const WS_URL = API_URL.replace(/^http/, "ws");
export const APP_URL = import.meta.env.VITE_URL;

export const GITHUB_URL = "https://github.com/MescoCzubinski/Meetly";
export const MODEL_URL =
  "https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2";
