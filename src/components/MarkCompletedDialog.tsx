import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CompletionTimeControl,
  isFuture,
  type CompletionMode,
} from "@/components/CompletionTimeControl";
import { fromLocalInput, nowLocalInput } from "@/lib/completion-time";

export function MarkCompletedDialog({
  open,
  onOpenChange,
  delayMinutes,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  delayMinutes: number;
  pending?: boolean;
  onConfirm: (completedAtIso: string) => void;
}) {
  const [mode, setMode] = useState<CompletionMode>("now");
  const [value, setValue] = useState(nowLocalInput());

  useEffect(() => {
    if (open) {
      setMode("now");
      setValue(nowLocalInput());
    }
  }, [open]);

  const blocked = mode === "earlier" && (!value || isFuture(value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark completed</DialogTitle>
          <DialogDescription>When was this job finished?</DialogDescription>
        </DialogHeader>
        <CompletionTimeControl
          mode={mode}
          onModeChange={setMode}
          value={value}
          onValueChange={setValue}
          delayMinutes={delayMinutes}
          allowNotYet={false}
          idPrefix="mark-completed"
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={blocked || pending}
            onClick={() => {
              const when =
                mode === "earlier" ? (fromLocalInput(value) ?? new Date()) : new Date();
              onConfirm(when.toISOString());
            }}
          >
            {pending ? "Saving…" : "Mark completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
