import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";

export default function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Leave?",
  description = "You will go back to the main page.",
  confirmLabel = "Leave",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <Button
            variant="neutral"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Stay
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
}
