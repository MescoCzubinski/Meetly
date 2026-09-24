import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputWithButton({
  onSubmit,
  button,
  buttonLabel,
  ...inputProps
}: Omit<React.ComponentProps<"input">, "onSubmit"> & {
  onSubmit: () => void;
  button: React.ReactNode;
  buttonLabel?: string;
}) {
  return (
    <form
      className="flex w-full items-center space-x-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input autoComplete="off" className="h-12 text-lg" {...inputProps} />
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
