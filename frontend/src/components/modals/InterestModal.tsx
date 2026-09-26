import { X } from "lucide-react";
import Modal from "./Modal";
import { Badge } from "@/components/ui/badge";

type Props = {
  interests: string[];
  onRemove: (index: number) => void;
};

export function InterestList({ interests, onRemove }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interest, index) => (
        <Badge key={index} variant="neutral" className="text-base">
          {interest}
          <button
            type="button"
            className="cursor-pointer"
            aria-label={`Remove ${interest}`}
            onClick={() => onRemove(index)}
          >
            <X />
          </button>
        </Badge>
      ))}
    </div>
  );
}

export default function InterestModal({
  open,
  onOpenChange,
  interests,
  onRemove,
}: Props & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Your interests">
      <InterestList interests={interests} onRemove={onRemove} />
    </Modal>
  );
}
