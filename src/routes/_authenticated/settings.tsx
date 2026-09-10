import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  EmailPreview,
  DEFAULT_BUTTON_COLOR,
  HEX_RE,
  buttonLuminance,
} from "@/components/EmailPreview";
import { cn } from "@/lib/utils";

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
const MAX_LOGO_BYTES = 1024 * 1024;
const LOGO_TYPES = [...ALLOWED_TYPES, "image/svg+xml"];
const PRESET_COLORS = ["#4F6EF7", "#1a1a1a", "#0F766E", "#B45309", "#9D174D", "#4338CA"];

function SettingsPage() {
  const business = useBusiness();
  return <SettingsForm key={business.id} />;
}

function SettingsForm() {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: business.name,
    review_url: business.review_url,
    website_url: business.website_url ?? "",
    from_name: business.from_name,
    reply_to_email: business.reply_to_email ?? "",
    postal_address: business.postal_address ?? "",
    request_delay_minutes: String(business.request_delay_minutes),
    reminder_enabled: business.reminder_enabled,
    reminder_delay_days: String(business.reminder_delay_days),
    ask_window_days: String(business.ask_window_days ?? 90),
    ask_window_days_requestor: String(business.ask_window_days_requestor ?? 180),
    email_template: business.email_template ?? "personal",
    custom_intro: business.custom_intro ?? "",
    custom_body: business.custom_body ?? "",
    sender_photo_url: business.sender_photo_url ?? null,
    logo_url: business.logo_url ?? null,
    button_color: business.button_color ?? DEFAULT_BUTTON_COLOR,
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [colorText, setColorText] = useState(business.button_color ?? DEFAULT_BUTTON_COLOR);
  const [colorError, setColorError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const photoEnabled = form.email_template === "personal";
  const isCustom = form.email_template === "custom";

  type CopyCheck = { verdict: string; matched: string; reason: string };
  const [copyCheck, setCopyCheck] = useState<CopyCheck | null>(null);

  useEffect(() => {
    if (!isCustom) {
      setCopyCheck(null);
      return;
    }
    const text = form.custom_body.trim();
    if (!text) {
      setCopyCheck(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_review_copy", { p_text: text });
      if (cancelled || error) return;
      setCopyCheck(data?.[0] ?? null);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.custom_body, isCustom]);

  const saveBlocked = copyCheck?.verdict === "block";

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
          website_url: form.website_url.trim() || null,
          from_name: form.from_name.trim(),
          reply_to_email: form.reply_to_email.trim() || null,
          postal_address: form.postal_address.trim() || null,
          request_delay_minutes: Number(form.request_delay_minutes) || 0,
          reminder_enabled: form.reminder_enabled,
          reminder_delay_days: Number(form.reminder_delay_days) || 0,
          ask_window_days: Number(form.ask_window_days) || 90,
          ask_window_days_requestor: Number(form.ask_window_days_requestor) || 180,
          email_template: form.email_template,
          custom_intro: form.custom_intro.trim() || null,
          custom_body: form.custom_body.trim() || null,
          sender_photo_url: form.sender_photo_url,
          logo_url: form.logo_url,
          button_color: form.button_color,
        })
        .eq("id", business.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => {
      if (e.message.includes("REVIEW_COPY_BLOCKED")) {
        const detail = e.message.split("REVIEW_COPY_BLOCKED")[1]?.replace(/^[:\s]+/, "").trim();
        setBodyError(detail || "This message cannot be sent.");
        return;
      }
      toast.error("Couldn't save settings", { description: e.message });
    },
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

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError(null);

    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError("Please choose a JPG, PNG, WEBP or SVG image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("That image is larger than 1MB.");
      return;
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${business.id}/${crypto.randomUUID()}.${ext}`;

    setLogoUploading(true);
    const { error } = await supabase.storage
      .from("business-photos")
      .upload(path, file, { contentType: file.type, upsert: false });
    setLogoUploading(false);

    if (error) {
      setLogoError(error.message);
      return;
    }

    const { data } = supabase.storage.from("business-photos").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    toast.success("Logo uploaded", { description: "Save changes to keep it." });
  }

  function applyColor(value: string) {
    setColorText(value);
    if (!HEX_RE.test(value)) {
      setColorError("Enter a colour like #4F6EF7.");
      return;
    }
    setColorError(null);
    setForm((f) => ({ ...f, button_color: value }));
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
    if (form.website_url.trim()) {
      try {
        const website = new URL(form.website_url.trim());
        if (!website.protocol.startsWith("http")) throw new Error();
      } catch {
        setWebsiteError("Enter a valid URL starting with https://");
        return;
      }
    }
    setWebsiteError(null);
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
                <p className="text-xs text-muted-foreground">
                  The name recipients see in their inbox, above the subject line.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://www.example.com"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              />
              {websiteError ? <p className="text-sm text-destructive">{websiteError}</p> : null}
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
              <Label htmlFor="postal_address">Contact information</Label>
              <Textarea
                id="postal_address"
                rows={4}
                placeholder={`Virginia Notary\n540-603-0359\nnotary@virginia-notary.com\nCharlottesville, VA 22901`}
                value={form.postal_address}
                onChange={(e) => setForm({ ...form, postal_address: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Shown at the bottom of every email. A physical mailing address is required by law.
                Add a phone number or email address above it if you want replies to reach you
                directly.
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border bg-card p-5 shadow-card md:p-6">
            <div>
              <h2 className="text-lg font-semibold">Email style</h2>
              <p className="text-sm text-muted-foreground">
                Choose how your review request emails read.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Logo</Label>
              <div className="flex flex-wrap items-center gap-4">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="max-h-[44px] w-auto" />
                ) : (
                  <div className="flex h-11 items-center rounded-md bg-muted px-3 text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={logoUploading}
                    onClick={() => logoRef.current?.click()}
                  >
                    {logoUploading ? "Uploading…" : form.logo_url ? "Replace logo" : "Upload logo"}
                  </Button>
                  {form.logo_url ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, logo_url: null })}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={onLogoChange}
                />
              </div>
              {logoError ? <p className="text-sm text-destructive">{logoError}</p> : null}
              <p className="text-xs text-muted-foreground">
                Appears in the footer of every review request email. Stored publicly so email apps
                can display it.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="button_color">Button colour</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  aria-label="Pick button colour"
                  type="color"
                  value={HEX_RE.test(colorText) ? colorText : DEFAULT_BUTTON_COLOR}
                  onChange={(e) => applyColor(e.target.value.toUpperCase())}
                  className="h-9 w-12 cursor-pointer rounded-md border bg-card p-1"
                />
                <Input
                  id="button_color"
                  value={colorText}
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-36"
                />
                <button
                  type="button"
                  onClick={() => applyColor(DEFAULT_BUTTON_COLOR)}
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Reset to default
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Use ${c}`}
                    onClick={() => applyColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      "h-7 w-7 rounded-full border",
                      form.button_color.toLowerCase() === c.toLowerCase() &&
                        "ring-2 ring-primary ring-offset-2",
                    )}
                  />
                ))}
              </div>
              {colorError ? <p className="text-sm text-destructive">{colorError}</p> : null}
              {!colorError && buttonLuminance(form.button_color) > 0.7 ? (
                <div className="rounded-lg border bg-status-queued p-4">
                  <p className="text-sm text-status-queued-foreground">
                    This colour is too light for white text. The button will be sent in near-black
                    instead so it stays readable.
                  </p>
                </div>
              ) : null}
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
                      The whole email is yours, including how you sign off. Separate paragraphs
                      with a blank line. Use {"{name}"} for the customer's first name,{" "}
                      {"{business}"} for your business name, and {"{service}"} for the service
                      type.
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

                {copyCheck?.verdict === "ok" ? (
                  <p className="text-sm text-status-sent-foreground">Looks good.</p>
                ) : null}
                {copyCheck?.verdict === "warn" ? (
                  <div className="rounded-lg border bg-status-queued p-4">
                    <p className="text-sm font-medium text-status-queued-foreground">
                      Worth reconsidering
                    </p>
                    <p className="mt-1 text-sm text-status-queued-foreground">{copyCheck.reason}</p>
                  </div>
                ) : null}
                {copyCheck?.verdict === "block" ? (
                  <div className="rounded-lg border bg-status-failed p-4">
                    <p className="text-sm font-medium text-status-failed-foreground">
                      This cannot be sent
                    </p>
                    <p className="mt-1 text-sm text-status-failed-foreground">{copyCheck.reason}</p>
                  </div>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  Review requests must go to every customer the same way, and must not ask for a
                  rating, a positive review, or offer anything in return. These rules come from
                  Google's review policy and the FTC's rule on consumer reviews.
                </p>
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

          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-card md:p-6">
            <div>
              <h2 className="text-lg font-semibold">How often to ask</h2>
              <p className="text-sm text-muted-foreground">
                How long to wait before asking the same person again.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ask_window_days">Days between asks</Label>
                <Input
                  id="ask_window_days"
                  type="number"
                  min={0}
                  value={form.ask_window_days}
                  onChange={(e) => setForm({ ...form, ask_window_days: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ask_window_days_requestor">
                  Days between asks for business contacts
                </Label>
                <Input
                  id="ask_window_days_requestor"
                  type="number"
                  min={0}
                  value={form.ask_window_days_requestor}
                  onChange={(e) =>
                    setForm({ ...form, ask_window_days_requestor: e.target.value })
                  }
                />
              </div>
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

            <Button type="submit" disabled={save.isPending || saveBlocked}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <EmailPreview
            template={form.email_template}
            businessName={form.name}
            fromName={form.from_name}
            replyToEmail={form.reply_to_email}
            customIntro={form.custom_intro}
            customBody={form.custom_body}
            senderPhotoUrl={form.sender_photo_url}
            postalAddress={form.postal_address}
            logoUrl={form.logo_url}
            buttonColor={form.button_color}
          />
        </div>
      </div>
    </div>
  );
}
