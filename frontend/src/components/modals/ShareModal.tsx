import Modal from "@/components/modals/Modal";
import QRCode from "@/components/QRCode";

export default function ShareModal({
  open,
  onOpenChange,
  code,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Invite">
      <QRCode code={code} />
    </Modal>
  );
}
