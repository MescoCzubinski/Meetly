import { useState } from "react";
import { Plus } from "lucide-react";
import InputWithButton from "@/components/InputWithButton";

export default function InterestInput({
  onAdd,
  autoFocus,
}: {
  onAdd: (interest: string) => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <InputWithButton
      id="interests"
      autoFocus={autoFocus}
      placeholder="Type your interests"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onSubmit={(interest) => {
        onAdd(interest);
        setValue("");
      }}
      button={<Plus />}
      buttonLabel="Add interest"
    />
  );
}
