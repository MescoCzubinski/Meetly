import { useState } from "react";
import { Plus } from "lucide-react";
import { InputWithButton } from "@/components/InputWithButton";
import { toast } from "@/components/ui/toast";

export const InterestInput = ({
  interests,
  onAdd,
  autoFocus,
}: {
  interests: string[];
  onAdd: (interest: string) => void;
  autoFocus?: boolean;
}) => {
  const [value, setValue] = useState("");

  return (
    <InputWithButton
      id="interests"
      autoFocus={autoFocus}
      placeholder="Type your interests"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onSubmit={(interest) => {
        const existing = interests.find(
          (i) => i.toLowerCase() === interest.toLowerCase(),
        );
        if (existing) {
          toast.add({
            type: "error",
            title: "Already added",
            description: `"${existing}" is already on your list`,
          });
          return;
        }
        onAdd(interest);
        setValue("");
      }}
      button={<Plus />}
      buttonLabel="Add interest"
    />
  );
};
