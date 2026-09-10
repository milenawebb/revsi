import { Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCsv, guessMapping, isValidEmail, type CsvTable } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";


const MAX_BYTES = 2 * 1024 * 1024;

const FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Phone", required: false },
  { key: "service_type", label: "Service type", required: false },
  { key: "completed_at", label: "Completed date", required: false },
] as const;

type Mapping = Record<string, string>;
type Parsed = { name: string; email: string; phone: string; service_type: string; completed_at: string };
type Skipped = { row: number; name: string; email: string; reason: string };

export type ImportFlowProps = {
  /** Called after an import run finishes. Used by the dialog to close itself. */
  onFinished?: () => void;
  /** Show the page heading. Off inside the dialog, which has its own title. */
  showHeading?: boolean;
};

export function ImportFlow(props: ImportFlowProps) {
  const business = useBusiness();
  return <ImportFlowInner key={business.id} {...props} />;
}

function ImportFlowInner({ onFinished, showHeading = true }: ImportFlowProps) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [filename, setFilename] = useState<string | null>(null);
  const [table, setTable] = useState<CsvTable | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [mode, setMode] = useState<"contacts" | "ask">("contacts");
  const [cap, setCap] = useState(String(business.daily_send_cap));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const { data: history = [] } = useQuery({
    queryKey: ["import-batches", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_batches")
        .select("id, created_at, filename, mode, imported_count, skipped_count, row_count")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Existing customers + optouts, used for the skip checks.
  const { data: existing } = useQuery({
    queryKey: ["import-existing", business.id],
    queryFn: async () => {
      const [c, o] = await Promise.all([
        supabase.from("customers").select("email").eq("business_id", business.id).limit(5000),
        supabase.from("contact_optouts").select("email").eq("business_id", business.id).limit(5000),
      ]);
      if (c.error) throw c.error;
      if (o.error) throw o.error;
      return {
        customers: new Set(
          (c.data ?? []).map((r) => (r.email ?? "").toLowerCase().trim()).filter(Boolean),
        ),
        optouts: new Set(
          (o.data ?? []).map((r) => (r.email ?? "").toLowerCase().trim()).filter(Boolean),
        ),
      };
    },
  });

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    setResult(null);
    if (file.size > MAX_BYTES) {
      setFileError("That file is larger than 2MB. Please split it up.");
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      setFileError("We couldn't find any rows in that file.");
      return;
    }
    setFilename(file.name);
    setTable(parsed);
    setMapping(guessMapping(parsed.headers));
  }

  const review = useMemo(() => {
    if (!table || !mapping["name"] || !mapping["email"]) return null;
    const idx = (field: string) => table.headers.indexOf(mapping[field] ?? "");
    const seen = new Set<string>();
    const rows: Parsed[] = [];
    const skipped: Skipped[] = [];

    table.rows.forEach((r, i) => {
      const get = (field: string) => {
        const at = idx(field);
        return at >= 0 ? (r[at] ?? "").trim() : "";
      };
      const name = get("name");
      const email = get("email").toLowerCase();
      const record = {
        row: i + 2,
        name: name || "—",
        email: email || "—",
      };
      const reason = !email
        ? "No email address"
        : !isValidEmail(email)
          ? "Email looks invalid"
          : seen.has(email)
            ? "Duplicate in this file"
            : existing?.customers.has(email)
              ? "Already a customer"
              : existing?.optouts.has(email)
                ? "Unsubscribed"
                : null;
      if (reason) {
        skipped.push({ ...record, reason });
        return;
      }
      seen.add(email);
      rows.push({
        name: name || email,
        email,
        phone: get("phone"),
        service_type: get("service_type"),
        completed_at: get("completed_at"),
      });
    });

    return { rows, skipped, total: table.rows.length };
  }, [table, mapping, existing]);

  const capNumber = Math.max(1, Number(cap) || 1);
  const finishDate = useMemo(() => {
    if (!review) return null;
    const days = Math.max(1, Math.ceil(review.rows.length / capNumber));
    const d = new Date();
    d.setDate(d.getDate() + days - 1);
    return d.toISOString();
  }, [review, capNumber]);

  function reset() {
    setTable(null);
    setFilename(null);
    setMapping({});
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function runImport() {
    if (!review || review.rows.length === 0) return;
    setRunning(true);
    setProgress(0);
    setResult(null);
    try {
      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          business_id: business.id,
          filename,
          mode,
          row_count: review.total,
        })
        .select("id")
        .single();
      if (batchError) throw batchError;

      let imported = 0;
      const failed: Skipped[] = [];

      for (let i = 0; i < review.rows.length; i++) {
        const row = review.rows[i]!;
        try {
          const { data: customer, error: cErr } = await supabase
            .from("customers")
            .insert({
              business_id: business.id,
              name: row.name,
              email: row.email,
              phone: row.phone || null,
            })
            .select("id")
            .single();
          if (cErr) throw cErr;

          if (mode === "ask") {
            const completedAt = row.completed_at ? new Date(row.completed_at) : new Date();
            const completedIso = isNaN(completedAt.getTime())
              ? new Date().toISOString()
              : completedAt.toISOString();

            const { data: service, error: sErr } = await supabase
              .from("services")
              .insert({
                business_id: business.id,
                customer_id: customer.id,
                service_type: row.service_type || null,
                status: "completed",
                completed_at: completedIso,
                import_batch_id: batch.id,
              })
              .select("id")
              .single();
            if (sErr) throw sErr;

            const { data: slot, error: slotErr } = await supabase.rpc("next_send_slot", {
              p_business_id: business.id,
            });
            if (slotErr) throw slotErr;
            if (slot) {
              const { error: rErr } = await supabase
                .from("review_requests")
                .update({ send_after: slot })
                .eq("service_id", service.id)
                .eq("kind", "initial");
              if (rErr) throw rErr;
            }
          }
          imported++;
        } catch (e) {
          failed.push({
            row: i + 2,
            name: row.name,
            email: row.email,
            reason: e instanceof Error ? e.message : "Could not import",
          });
        }
        setProgress(Math.round(((i + 1) / review.rows.length) * 100));
        // yield to the browser so the UI keeps painting
        await new Promise((r) => setTimeout(r, 0));
      }

      const skippedCount = review.skipped.length + failed.length;
      await supabase
        .from("import_batches")
        .update({ imported_count: imported, skipped_count: skippedCount })
        .eq("id", batch.id);

      if (onFinished) onFinished();
      else setResult({ imported, skipped: skippedCount });
      toast.success("Import finished", {
        description: `${imported} added, ${skippedCount} skipped.`,
      });
      queryClient.invalidateQueries();
      reset();
    } catch (e) {
      toast.error("Import failed", {
        description: e instanceof Error ? e.message : "Something went wrong.",
      });
    } finally {
      setRunning(false);
    }
  }

  const capUpdate = async (value: string) => {
    setCap(value);
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return;
    await supabase.from("businesses").update({ daily_send_cap: n }).eq("id", business.id);
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import</h1>
        <p className="text-sm text-muted-foreground">
          Bring past customers in from a spreadsheet.
        </p>
      </div>

      {result ? (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Import complete</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.imported} added, {result.skipped} skipped.
          </p>
          <Button asChild className="mt-4">
            <Link to="/jobs">Go to Jobs</Link>
          </Button>
        </div>
      ) : null}

      {/* Step 1 */}
      <section className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold">1. Upload a CSV</h2>
        <p className="mt-1 text-xs text-muted-foreground">Up to 2MB.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={running}>
            <Upload className="mr-2 size-4" />
            Choose file
          </Button>
          <span className="text-sm text-muted-foreground">{filename ?? "No file chosen"}</span>
          {table ? (
            <Button variant="ghost" onClick={reset} disabled={running}>
              Clear
            </Button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        {fileError ? <p className="mt-3 text-sm text-destructive">{fileError}</p> : null}

        {table ? (
          <div className="mt-5 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr>
                  {table.headers.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {table.headers.map((_, c) => (
                      <td key={c} className="px-3 py-2 text-muted-foreground">
                        {r[c] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* Step 2 */}
      {table ? (
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-sm font-semibold">2. Match your columns</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {f.label}
                  {f.required ? " *" : ""}
                </Label>
                <Select
                  value={mapping[f.key] || "__none"}
                  onValueChange={(v) =>
                    setMapping((m) => ({ ...m, [f.key]: v === "__none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Not mapped" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Not mapped</SelectItem>
                    {table.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          {!mapping["name"] || !mapping["email"] ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Choose which columns hold the name and email to continue.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Step 3 */}
      {review ? (
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-sm font-semibold">3. Review</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Rows found", value: review.total },
              { label: "Will be skipped", value: review.skipped.length },
              { label: "Will be imported", value: review.rows.length },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          {review.skipped.length > 0 ? (
            <div className="mt-5 max-h-64 overflow-y-auto rounded-lg border">
              {review.skipped.map((s) => (
                <div
                  key={`${s.row}-${s.email}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-b-0"
                >
                  <span>
                    <span className="font-medium">{s.name}</span>{" "}
                    <span className="text-muted-foreground">{s.email}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Row {s.row} · {s.reason}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Step 4 */}
      {review && review.rows.length > 0 ? (
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-sm font-semibold">4. What should happen?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "contacts" as const,
                title: "Add as contacts only",
                sub: "They will be in your list. Attach them to a job when you are ready to ask.",
              },
              {
                value: "ask" as const,
                title: "Add and ask",
                sub: "Sends a review request to each of them, spread out over several days.",
              },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setMode(o.value)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  mode === o.value ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                )}
              >
                <p className="text-sm font-semibold">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.sub}</p>
              </button>
            ))}
          </div>

          {mode === "ask" ? (
            <div className="mt-5 space-y-4">
              <div className="max-w-[200px] space-y-1.5">
                <Label htmlFor="cap" className="text-xs text-muted-foreground">
                  Emails per day
                </Label>
                <Input
                  id="cap"
                  type="number"
                  min={1}
                  value={cap}
                  onChange={(e) => capUpdate(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {review.rows.length} contacts at {capNumber} a day, finishing around{" "}
                {formatDate(finishDate)}.
              </p>
              <div className="flex gap-3 rounded-lg border border-status-queued-foreground/30 bg-status-queued p-4 text-status-queued-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm">
                  These people may not remember you. Only send to customers you actually worked
                  with, and expect a lower response rate than asking right after a job.
                </p>
              </div>
            </div>
          ) : null}

          {running ? (
            <div className="mt-5 space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">Importing… {progress}%</p>
            </div>
          ) : null}

          <Button className="mt-5" onClick={runImport} disabled={running}>
            {running ? "Importing…" : `Import ${review.rows.length} contacts`}
          </Button>
        </section>
      ) : null}

      {/* History */}
      <section className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold">Past imports</h2>
        </div>
        <div className="hidden grid-cols-[1fr_1.6fr_1fr_0.7fr_0.7fr] gap-4 border-t border-border/60 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <span>Date</span>
          <span>File</span>
          <span>Mode</span>
          <span>Imported</span>
          <span>Skipped</span>
        </div>
        {history.length === 0 ? (
          <p className="border-t border-border/60 px-5 py-6 text-sm text-muted-foreground">
            No imports yet.
          </p>
        ) : (
          history.map((b) => (
            <div
              key={b.id}
              className="grid gap-1 border-t border-border/60 px-5 py-3 text-sm md:grid-cols-[1fr_1.6fr_1fr_0.7fr_0.7fr] md:items-center md:gap-4"
            >
              <span className="text-muted-foreground">{formatDate(b.created_at)}</span>
              <span className="truncate font-medium">{b.filename ?? "—"}</span>
              <span className="text-muted-foreground">
                {b.mode === "ask" ? "Add and ask" : "Contacts only"}
              </span>
              <span className="text-muted-foreground">{b.imported_count}</span>
              <span className="text-muted-foreground">{b.skipped_count}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
