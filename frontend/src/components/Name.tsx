import { useState } from "react";
import InputWithButton from "./InputWithButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Name({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Label htmlFor="name" className="text-2xl">
            Enter your name:
          </Label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InputWithButton
          id="name"
          autoFocus
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onSubmit={() => {
            const value = name.trim();
            if (value) onSubmit(value);
          }}
          button="Next"
        />
      </CardContent>
    </Card>
  );
}
