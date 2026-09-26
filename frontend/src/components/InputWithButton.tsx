import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputWithButton({
  onSubmit,
  button,
  buttonLabel,
  maxLength,
  onChange,
  ...inputProps
}: Omit<React.ComponentProps<"input">, "onSubmit"> & {
  onSubmit: () => void;
  button: React.ReactNode;
  buttonLabel?: string;
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!showError) return;
    const timer = setTimeout(() => setShowError(false), 1300);
    return () => clearTimeout(timer);
  }, [showError]);

  return (
    <div className="flex w-full flex-col">
      <form
        className="flex w-full items-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Input
          autoComplete="off"
          className="h-12 text-lg"
          {...inputProps}
          onChange={(e) => {
            if (maxLength && e.target.value.length > maxLength) {
              e.target.value = e.target.value.slice(0, maxLength);
              setShowError(true);
            }
            onChange?.(e);
          }}
        />
        <Button
          type="submit"
          variant="noShadow"
          className="h-12 min-w-12 shrink-0 px-3 text-lg [&_svg]:size-6"
          aria-label={buttonLabel}
        >
          {button}
        </Button>
      </form>
      <div
        aria-hidden={!showError}
        className={`grid transition-[grid-template-rows] duration-300 ${showError ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pt-4 w-full text-center">
            max {maxLength} characters
          </p>
        </div>
      </div>
    </div>
  );
}
