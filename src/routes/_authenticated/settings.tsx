import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EmailPreview, FIXED_ASK_LINE } from "@/components/EmailPreview";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Review Requests" },
      { name: "description", content: "Business details, timing and reminder settings." },
      { property: "og:title", content: "Settings — Review Requests" },
      { property: "og:description", content: "Business details, timing and reminder settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const TEMPLATES = [
  { value: "personal", label: "Personal", sub: "Warm and first person. Shows your photo." },
  { value: "short", label: "Short", sub: "Two lines and a button." },
  { value: "question", label: "Question", sub: "Asks what they'd tell a friend." },
  { value: "warm", label: "Classic", sub: "Polite and formal." },
  { value: "custom", label: "Custom", sub: "Write it yourself." },
] as const;

const INTRO_MAX = 300;
const CUSTOM_BODY_MAX = 1500;
const PLACEHOLDER_CHIPS = ["{name}", "{business}", "{service}"] as const;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function SettingsPage() {
  const business = useBusiness();
  return <SettingsForm key={business.id} />;
}

function SettingsForm() {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: business.name,
    review_url: business.review_url,
    from_name: business.from_name,
    reply_to_email: business.reply_to_email ?? "",
    postal_address: business.postal_address ?? "",
    request_delay_minutes: String(business.request_delay_minutes),
    reminder_enabled: business.reminder_enabled,
    reminder_delay_days: String(business.reminder_delay_days),
    email_template: business.email_template ?? "personal",
    custom_intro: business.custom_intro ?? "",
    custom_body: business.custom_body ?? "",
    sender_photo_url: business.sender_photo_url ?? null,
  });
  const [urlError, setUrlError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const photoEnabled = form.email_template === "personal";
  const isCustom = form.email_template === "custom";

  function insertPlaceholder(token: string) {
    const el = bodyRef.current;
    if (!el) {
      setForm((f) => ({ ...f, custom_body: f.custom_body + token }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const next = (el.value.slice(0, start) + token + el.value.slice(end)).slice(
      0,
      CUSTOM_BODY_MAX,
    );
    setForm((f) => ({ ...f, custom_body: next }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.min(start + token.length, CUSTOM_BODY_MAX);
      el.setSelectionRange(pos, pos);
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("businesses")
        .update({
          name: form.name.trim(),
          review_url: form.review_url.trim(),
          from_name: form.from_name.trim(),
          reply_to_email: form.reply_to_email.trim() || null,
          postal_address: form.postal_address.trim() || null,
          request_delay_minutes: Number(form.request_delay_minutes) || 0,
          reminder_enabled: form.reminder_enabled,
          reminder_delay_days: Number(form.reminder_delay_days) || 0,
          email_template: form.email_template,
          custom_intro: form.custom_intro.trim() || null,
          custom_body: form.custom_body.trim() || null,
          sender_photo_url: form.sender_photo_url,
        })
        .eq("id", business.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't save settings", { description: e.message }),
  });

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("That image is larger than 2MB.");
      return;
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${business.id}/${crypto.randomUUID()}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage
      .from("business-photos")
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);

    if (error) {
      setPhotoError(error.message);
      return;
    }

    const { data } = supabase.storage.from("business-photos").getPublicUrl(path);
    setForm((f) => ({ ...f, sender_photo_url: data.publicUrl }));
    toast.success("Photo uploaded", { description: "Save changes to keep it." });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = new URL(form.review_url.trim());
      if (!url.protocol.startsWith("http")) throw new Error();
    } catch {
      setUrlError("Enter a valid URL starting with https://");
      return;
    }
    setUrlError(null);
    if (isCustom && !form.custom_body.trim()) {
      setBodyError("Write your message before saving, or choose a different template.");
      return;
    }
    setBodyError(null);
    save.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">How your review requests are sent.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-6 rounded-xl border bg-card p-5 shadow-card md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_name">From name</Label>
                <Input
                  id="from_name"
                  required
                  value={form.from_name}
                  onChange={(e) => setForm({ ...form, from_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_url">Review link</Label>
              <Input
                id="review_url"
                required
                value={form.review_url}
                onChange={(e) => setForm({ ...form, review_url: e.target.value })}
              />
              {urlError ? <p className="text-sm text-destructive">{urlError}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reply_to_email">Reply-to email</Label>
                <Input
                  id="reply_to_email"
                  type="email"
                  value={form.reply_to_email}
                  onChange={(e) => setForm({ ...form, reply_to_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request_delay_minutes">Delay before sending (minutes)</Label>
                <Input
                  id="request_delay_minutes"
                  type="number"
                  min={0}
                  value={form.request_delay_minutes}
                  onChange={(e) => setForm({ ...form, request_delay_minutes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_address">Postal address</Label>
              <Textarea
                id="postal_address"
                rows={2}
                value={form.postal_address}
                onChange={(e) => setForm({ ...form, postal_address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6 rounded-xl border bg-card p-5 shadow-card md:p-6">
            <div>
              <h2 className="text-lg font-semibold">Email style</h2>
              <p className="text-sm text-muted-foreground">
                Choose how your review request emails read.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {TEMPLATES.map((t) => {
                const selected = form.email_template === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm({ ...form, email_template: t.value })}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "bg-card hover:bg-muted/50",
                    )}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
                  </button>
                );
              })}
            </div>

            {isCustom ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom_body">Your message</Label>
                  <Textarea
                    ref={bodyRef}
                    id="custom_body"
                    rows={8}
                    maxLength={CUSTOM_BODY_MAX}
                    value={form.custom_body}
                    onChange={(e) => setForm({ ...form, custom_body: e.target.value })}
                  />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="max-w-md text-xs text-muted-foreground">
                      Separate paragraphs with a blank line. Use {"{name}"} for the customer's
                      first name, {"{business}"} for your business name, and {"{service}"} for
                      the service type.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {form.custom_body.length}/{CUSTOM_BODY_MAX}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PLACEHOLDER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => insertPlaceholder(chip)}
                        className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  {bodyError ? <p className="text-sm text-destructive">{bodyError}</p> : null}
                </div>

                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest">
                      Fixed ending
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{FIXED_ASK_LINE}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This line is always added to the end and cannot be changed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="custom_intro">Add a line of your own (optional)</Label>
                <Textarea
                  id="custom_intro"
                  rows={3}
                  maxLength={INTRO_MAX}
                  value={form.custom_intro}
                  onChange={(e) => setForm({ ...form, custom_intro: e.target.value })}
                />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="max-w-md text-xs text-muted-foreground">
                    This appears as the second line of the email, in your words. For example: I
                    hope the paperwork all went through smoothly.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.custom_intro.length}/{INTRO_MAX}
                  </p>
                </div>
              </div>
            )}

            <div className={cn("space-y-3", !photoEnabled && "opacity-50")}>
              <Label>Sender photo</Label>
              {!photoEnabled ? (
                <p className="text-xs text-muted-foreground">
                  Only shown on the Personal template.
                </p>
              ) : null}

              <div className="flex items-center gap-4">
                {form.sender_photo_url ? (
                  <img
                    src={form.sender_photo_url}
                    alt="Sender"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!photoEnabled || uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? "Uploading…" : form.sender_photo_url ? "Replace photo" : "Upload photo"}
                  </Button>
                  {form.sender_photo_url ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!photoEnabled}
                      onClick={() => setForm({ ...form, sender_photo_url: null })}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onPhotoChange}
                />
              </div>

              {photoError ? <p className="text-sm text-destructive">{photoError}</p> : null}
              <p className="text-xs text-muted-foreground">
                This photo is stored publicly so email apps can display it. JPG, PNG or WEBP, up to
                2MB.
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border bg-card p-5 shadow-card md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Send a reminder</p>
                <p className="text-xs text-muted-foreground">
                  Follow up if the first email isn't clicked.
                </p>
              </div>
              <Switch
                checked={form.reminder_enabled}
                onCheckedChange={(v) => setForm({ ...form, reminder_enabled: v })}
              />
            </div>

            <div className="space-y-2 md:max-w-xs">
              <Label htmlFor="reminder_delay_days">Reminder delay (days)</Label>
              <Input
                id="reminder_delay_days"
                type="number"
                min={0}
                disabled={!form.reminder_enabled}
                value={form.reminder_delay_days}
                onChange={(e) => setForm({ ...form, reminder_delay_days: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <EmailPreview
            template={form.email_template}
            businessName={form.name}
            fromName={form.from_name}
            customIntro={form.custom_intro}
            senderPhotoUrl={form.sender_photo_url}
            postalAddress={form.postal_address}
          />
        </div>
      </div>
    </div>
  );
}
