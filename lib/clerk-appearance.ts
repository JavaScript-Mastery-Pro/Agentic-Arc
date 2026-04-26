import { dark } from "@clerk/ui/themes";
import type { NextClerkProviderProps } from "@clerk/nextjs/types";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorBackground: "var(--bg-surface)",
    colorDanger: "var(--state-error)",
    colorRing: "rgba(0, 200, 212, 0.32)",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  options: {
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "w-full rounded-lg border border-surface-border bg-surface shadow-none",
    card: "gap-5 bg-transparent p-7 shadow-none sm:p-8",
    header: "hidden",
    headerTitle: "text-2xl font-semibold tracking-tight text-copy-primary",
    headerSubtitle: "text-sm leading-6 text-copy-muted",
    socialButtonsBlockButton:
      "h-11 rounded-lg border-surface-border bg-base text-copy-primary transition hover:bg-elevated",
    dividerLine: "bg-surface-border",
    dividerText: "text-copy-muted",
    formFieldLabel: "text-sm font-medium text-copy-secondary",
    formFieldInput:
      "h-11 rounded-lg border-surface-border bg-base text-copy-primary shadow-none focus:border-brand focus:ring-2 focus:ring-brand-ring",
    formButtonPrimary:
      "h-11 rounded-lg bg-brand text-brand-foreground shadow-none transition hover:bg-brand-hover",
    footer: "hidden",
    footerActionText: "text-copy-muted",
    footerActionLink: "font-medium text-brand hover:text-brand-hover",
    identityPreview:
      "rounded-lg border border-surface-border bg-base text-copy-primary",
    identityPreviewEditButton: "text-brand hover:text-brand-hover",
    formFieldErrorText: "text-danger-foreground",
    formResendCodeLink: "text-brand hover:text-brand-hover",
    userButtonAvatarBox:
      "h-8 w-8 rounded-full ring-2 ring-base transition hover:ring-surface-border-strong",
    userButtonPopoverFooter: "hidden",
  },
} satisfies NonNullable<NextClerkProviderProps["appearance"]>;
