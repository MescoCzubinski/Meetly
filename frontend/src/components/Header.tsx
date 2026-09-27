import { useState } from "react";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmModal from "./modals/ConfirmModal";
import InterestModal, { InterestList } from "./modals/InterestModal";

export default function Header({
  onHome,
  interests,
  onRemove,
}: {
  onHome?: () => void;
  interests?: string[];
  onRemove?: (index: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [showingInterests, setShowingInterests] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-4 top-4 z-10 flex items-start justify-between [&>*]:pointer-events-auto">
      <button
        type="button"
        className={`flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 shadow-shadow ${onHome ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => onHome && setConfirming(true)}
      >
        <img src="/favicon-main.ico" alt="" className="size-8" />
        <span className="text-2xl font-heading">Meetly</span>
      </button>
      {interests && onRemove && (
        <>
          <Card
            size="sm"
            className="hidden max-h-[calc(100dvh-2rem)] w-72 overflow-y-auto md:flex"
          >
            <CardHeader>
              <CardTitle className="text-xl">Your interests</CardTitle>
            </CardHeader>
            <CardContent>
              <InterestList interests={interests} onRemove={onRemove} />
            </CardContent>
          </Card>
          <Button
            variant="neutral"
            aria-label="Your interests"
            className="size-13 md:hidden [&_svg]:size-6"
            onClick={() => setShowingInterests(true)}
          >
            <List />
          </Button>
          <InterestModal
            open={showingInterests}
            onOpenChange={setShowingInterests}
            interests={interests}
            onRemove={onRemove}
          />
        </>
      )}
      {onHome && (
        <ConfirmModal
          open={confirming}
          onOpenChange={setConfirming}
          onConfirm={onHome}
        />
      )}
    </header>
  );
}
