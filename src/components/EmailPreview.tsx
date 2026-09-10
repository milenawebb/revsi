type Props = {
  template: string;
  businessName: string;
  fromName: string;
  replyToEmail?: string | null;
  customIntro: string;
  customBody: string;
  senderPhotoUrl: string | null;
  postalAddress: string;
  logoUrl?: string | null;
  buttonColor?: string;
};

export const DEFAULT_BUTTON_COLOR = "#4F6EF7";
export const NEAR_BLACK = "#1a1a1a";
export const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function buttonLuminance(hex: string): number {
  if (!HEX_RE.test(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function effectiveButtonColor(hex: string): string {
  if (!HEX_RE.test(hex)) return DEFAULT_BUTTON_COLOR;
  return buttonLuminance(hex) > 0.7 ? NEAR_BLACK : hex;
}

const SAMPLE_NAME = "Sarah";
const SAMPLE_SERVICE = "loan signing";

export const FIXED_ASK_LINE =
  "If you have a moment, would you leave an honest review of your experience? It genuinely helps other people find us.";

export function substitutePlaceholders(text: string, biz: string): string {
  return text
    .replaceAll("{name}", SAMPLE_NAME)
    .replaceAll("{business}", biz)
    .replaceAll("{service}", SAMPLE_SERVICE);
}

export function customTemplateBody(body: string, biz: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) {
    return [`Hi ${SAMPLE_NAME},`, `Thank you for choosing ${biz}.`];
  }
  return trimmed
    .split(/\n\s*\n/)
    .map((p) => substitutePlaceholders(p.trim(), biz))
    .filter(Boolean);
}

export function templateBody(template: string, biz: string): string[] {
  const name = SAMPLE_NAME;
  const svc = SAMPLE_SERVICE;
  switch (template) {
    case "short":
      return [
        `Hi ${name}, thanks for choosing ${biz}.`,
        "Would you leave an honest review of your experience?",
      ];
    case "question":
      return [
        `Hi ${name},`,
        `Thanks for choosing ${biz} for your ${svc}.`,
        "What would you tell a friend who needed the same thing? If you have a moment, that is exactly what makes a helpful review.",
      ];
    case "warm":
      return [
        `Hi ${name},`,
        `Thank you for choosing ${biz}. It was a pleasure working with you.`,
        FIXED_ASK_LINE,
      ];
    case "personal":
    default:
      return [
        `Hi ${name},`,
        `It was good working with you on your ${svc}.`,
        "If you have a moment, would you share an honest review of how it went? It makes a real difference to a small business like mine.",
      ];
  }
}

export function EmailPreview({
  template,
  businessName,
  fromName,
  replyToEmail,
  customIntro,
  customBody,
  senderPhotoUrl,
  postalAddress,
  logoUrl,
  buttonColor = DEFAULT_BUTTON_COLOR,
}: Props) {
  const biz = businessName.trim() || "Your business";
  const isCustom = template === "custom";
  const lines = isCustom ? customTemplateBody(customBody, biz) : templateBody(template, biz);
  const [greeting, ...rest] = lines;
  const intro = customIntro.trim();

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Preview
      </p>

      <div className="mt-4 rounded-lg border bg-background p-5">
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            {fromName.trim() || biz}
          </p>
          <p className="text-xs text-muted-foreground">Thanks for choosing {biz}</p>
          {replyToEmail?.trim() ? (
            <p className="text-xs text-muted-foreground">Reply-to: {replyToEmail.trim()}</p>
          ) : null}
        </div>

        <hr className="my-4 border-border" />
        {senderPhotoUrl ? (
          <img
            src={senderPhotoUrl}
            alt={`${fromName || biz} sender photo`}
            className="mb-4 h-14 w-14 rounded-full object-cover"
          />
        ) : null}

        <p className="whitespace-pre-line text-sm text-foreground">{greeting}</p>
        {!isCustom && intro ? (
          <p className="mt-3 text-sm text-foreground">{intro}</p>
        ) : null}
        {rest.map((line) => (
          <p key={line} className="mt-3 whitespace-pre-line text-sm text-foreground">
            {line}
          </p>
        ))}

        <div className="mt-5">
          <span
            style={{ backgroundColor: effectiveButtonColor(buttonColor) }}
            className="inline-block cursor-default rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Leave a review
          </span>
        </div>

        {!isCustom ? (
          <>
            <p className="mt-5 text-sm text-foreground">Thanks again,</p>
            <p className="text-sm text-foreground">{fromName.trim() || biz}</p>
          </>
        ) : null}


        <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${biz} logo`}
              className="mb-3 max-h-[36px] max-w-[150px] object-contain"
            />
          ) : null}
          <p>You received this because you recently used {biz}.</p>
          {postalAddress.trim() ? (
            <p className="mt-1 whitespace-pre-line">{postalAddress.trim()}</p>
          ) : null}
          <p className="mt-1">
            <span className="cursor-default text-primary underline">Unsubscribe</span>
          </p>
        </div>
      </div>
    </div>
  );
}
