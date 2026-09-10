import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FUTURE_ERROR,
  FUTURE_ERROR_SHORT,
  fromLocalInput,
  sendTimeLine,
} from "@/lib/completion-time";

export type CompletionMode = "now" | "earlier" | "not_yet";

export function isFuture(value: string) {
  const d = fromLocalInput(value);
  return Boolean(d && d.getTime() > Date.now());
}

export function CompletionTimeControl({
  mode,
  onModeChange,
  value,
  onValueChange,
  delayMinutes,
  allowNotYet = true,
  idPrefix = "completion",
}: {
  mode: CompletionMode;
  onModeChange: (m: CompletionMode) => void;
  value: string;
  onValueChange: (v: string) => void;
  delayMinutes: number;
  allowNotYet?: boolean;
  idPrefix?: string;
}) {
  const chosen = fromLocalInput(value);
  const future = mode === "earlier" && isFuture(value);

  return (
    <div className="space-y-3">
      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as CompletionMode)}
        className="gap-2"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="now" id={`${idPrefix}-now`} />
          <Label htmlFor={`${idPrefix}-now`} className="font-normal">
            {allowNotYet ? "Completed now" : "Now"}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="earlier" id={`${idPrefix}-earlier`} />
          <Label htmlFor={`${idPrefix}-earlier`} className="font-normal">
            {allowNotYet ? "Completed earlier" : "Earlier"}
          </Label>
        </div>
        {allowNotYet ? (
          <div className="flex items-center gap-2">
            <RadioGroupItem value="not_yet" id={`${idPrefix}-not-yet`} />
            <Label htmlFor={`${idPrefix}-not-yet`} className="font-normal">
              Not completed yet
            </Label>
          </div>
        ) : null}
      </RadioGroup>

      {mode === "earlier" ? (
        <div className="space-y-1.5">
          <Input
            type="datetime-local"
            aria-label="Completion date and time"
            aria-invalid={future ? true : undefined}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
          {future ? (
            <p className="text-xs text-destructive">
              {allowNotYet ? FUTURE_ERROR : FUTURE_ERROR_SHORT}
            </p>
          ) : chosen ? (
            <p className="text-xs text-muted-foreground">{sendTimeLine(chosen, delayMinutes)}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
