import Modal from "./Modal";
import { Button } from "@/components/ui/button";

export default function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Leave?"
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
            Leave
          </Button>
        </>
      }
    >
      <p>You will go back to the main page.</p>
    </Modal>
  );
}
