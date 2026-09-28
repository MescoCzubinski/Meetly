import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_INPUT_LENGTH = 20;

const centerOnKeyboard = (el: HTMLElement) =>
  window.visualViewport?.addEventListener(
    "resize",
    () => el.scrollIntoView({ block: "center", behavior: "smooth" }),
    { once: true },
  );

export default function InputWithButton({
  onSubmit,
  button,
  buttonLabel,
  ...inputProps
}: Omit<React.ComponentProps<"input">, "onSubmit"> & {
  onSubmit: (value: string) => void;
  button: React.ReactNode;
  buttonLabel?: string;
}) {
  return (
    <form
      className="flex w-full items-center space-x-2"
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(inputProps.value).trim();
        if (!value) return;
        if (value.length > MAX_INPUT_LENGTH) {
          toast.add({
            type: "error",
            title: "Too long",
            description: `Use at most ${MAX_INPUT_LENGTH} characters`,
          });
          return;
        }
        onSubmit(value);
      }}
    >
      <Input
        autoComplete="off"
        className="h-12 text-lg"
        onFocus={(e) => centerOnKeyboard(e.currentTarget)}
        {...inputProps}
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
  );
}
