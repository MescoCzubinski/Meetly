import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(express.json());
const frontendOrigin = process.env.VITE_URL;
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

const port = process.env.SERVER_PORT;
const backendUrl = process.env.VITE_API_URL;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running at ${backendUrl}`);
});
