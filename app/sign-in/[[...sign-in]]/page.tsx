import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-20 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.1),_transparent_45%)]" />
      <div className="relative">
        <SignIn
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              card: "bg-zinc-900/90 border border-zinc-800 shadow-2xl shadow-cyan-950/20",
              headerTitle: "text-zinc-50",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton:
                "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
              socialButtonsBlockButtonText: "text-zinc-100",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-500",
              formFieldLabel: "text-zinc-300",
              formFieldInput:
                "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500/30",
              formButtonPrimary: "bg-cyan-500 text-zinc-950 hover:bg-cyan-400",
              footerActionText: "text-zinc-400",
              footerActionLink: "text-cyan-300 hover:text-cyan-200",
            },
          }}
        />
      </div>
    </main>
  );
}
