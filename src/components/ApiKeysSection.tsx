import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { formatDate, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

const INGEST_URL = "https://vsweyeklrswcoahqdaks.supabase.co/functions/v1/ingest";

const EXAMPLE_BODY = `{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5551234567",
  "service_type": "Loan signing",
  "completed_at": "2026-09-10T14:30:00Z",
  "external_id": "your-task-id",
  "role": "signer"
}`;

export function ApiKeysSection() {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("api_keys" as any)
        .select("id, name, key_prefix, last_used_at, revoked_at, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ApiKeyRow[];
    },
  });

  const revoke = useMutation({
    mutationFn: async (row: ApiKeyRow) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("api_keys" as any)
        .update({ revoked_at: new Date().toISOString() } as never)
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", business.id] });
      setRevokeTarget(null);
      toast.success("Key revoked.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not revoke key."),
  });

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Connections</h2>
          <p className="text-sm text-muted-foreground">
            Connect another system, like OpenSked, so a completed job there creates a review
            request here.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
          Create key
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !keys?.length ? (
        <p className="text-sm text-muted-foreground">No keys yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {keys.map((k) => {
            const revoked = k.revoked_at !== null;
            return (
              <li
                key={k.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                  revoked && "opacity-60",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {k.name}
                    {revoked ? (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Revoked
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    nr_{k.key_prefix}_…
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Created {formatDate(k.created_at)} ·{" "}
                    {k.last_used_at ? `Last used ${formatDateTime(k.last_used_at)}` : "Never used"}
                  </p>
                </div>
                {!revoked ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRevokeTarget(k)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted/50">
          How to send jobs
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <p className="text-sm text-muted-foreground">
            Send a POST request for each completed job:
          </p>
          <div className="rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed break-all">
            <p>POST {INGEST_URL}</p>
            <p className="mt-2">Header: x-api-key: your key</p>
            <p className="mt-2">Body:</p>
            <pre className="mt-1 whitespace-pre-wrap">{EXAMPLE_BODY}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            email is required. external_id prevents duplicates on retry. role is one of customer,
            requestor, signer or attendee.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <CreateKeyDialog
        businessId={business.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <AlertDialog open={revokeTarget !== null} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any system using "{revokeTarget?.name}" will stop working immediately. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeTarget && revoke.mutate(revokeTarget)}
              disabled={revoke.isPending}
            >
              {revoke.isPending ? "Revoking…" : "Revoke key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateKeyDialog({
  businessId,
  open,
  onOpenChange,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("OpenSked");
  const [newKey, setNewKey] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async (keyName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.rpc("create_api_key" as any, {
        p_business_id: businessId,
        p_name: keyName,
      });
      if (error) throw error;
      const row = (data as unknown as { api_key: string }[] | null)?.[0];
      if (!row?.api_key) throw new Error("No key returned");
      return row.api_key;
    },
    onSuccess: (key) => {
      setNewKey(key);
      queryClient.invalidateQueries({ queryKey: ["api-keys", businessId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create key."),
  });

  function close() {
    onOpenChange(false);
    setTimeout(() => {
      setName("OpenSked");
      setNewKey(null);
    }, 200);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent>
        {newKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Key created</DialogTitle>
              <DialogDescription>Copy this now. It will not be shown again.</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-muted p-3 font-mono text-xs break-all">{newKey}</div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  toast.success("Copied.");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button type="button" onClick={close}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create an API key</DialogTitle>
              <DialogDescription>
                Give the key a name so you remember which system uses it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="OpenSked"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!name.trim() || create.isPending}
                onClick={() => create.mutate(name.trim())}
              >
                {create.isPending ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
