import Modal from "@/components/modals/Modal";
import { MODEL_URL } from "@/lib/config";

const link = "underline underline-offset-2";

export default function AboutModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="About Meetly">
      <div className="flex flex-col gap-3">
        <p>
          A web app that helps people in one room find each other. A host starts
          a session, guests join with a 6-digit code or a QR code, and everyone
          types in their interests. People are shown as cards on a live graph,
          and the cards of people with similar interests are pulled together.
        </p>
        <p>
          Interests are matched by meaning, not spelling, using the{" "}
          <a className={link} href={MODEL_URL} target="_blank" rel="noreferrer">
            paraphrase-multilingual-MiniLM-L12-v2
          </a>{" "}
          embedding model.
        </p>
        <p>
          The UI is built with{" "}
          <a
            className={link}
            href="https://www.neobrutalism.dev"
            target="_blank"
            rel="noreferrer"
          >
            neobrutalism.dev
          </a>{" "}
          components (shadcn/ui on Base UI).
        </p>
        <p>
          The colors come from Vincent van Gogh's Vase with Twelve Sunflowers
          painting.
        </p>
      </div>
    </Modal>
  );
}
