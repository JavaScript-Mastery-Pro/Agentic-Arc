import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between px-14 py-12"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
        }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="h-6 w-6 rounded"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}>
            Ghost AI
          </span>
        </div>

        {/* Tagline + Stats */}
        <div className="space-y-10">
          <div>
            <h2
              className="text-2xl font-semibold tracking-tight leading-snug"
              style={{ color: "var(--text-primary)" }}>
              Your team&apos;s system
              <br />
              design workspace.
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}>
              From a plain-English prompt to a full architecture diagram and
              technical spec — without leaving the browser.
            </p>
          </div>

          <ol className="space-y-0">
            {[
              {
                step: "1",
                title: "Describe",
                description: "Write your system requirements in plain English.",
              },
              {
                step: "2",
                title: "Generate",
                description:
                  "Ghost AI maps it to nodes and edges on a shared canvas.",
              },
              {
                step: "3",
                title: "Refine",
                description:
                  "Edit, annotate, and export a full technical spec as Markdown.",
              },
            ].map((item, index) => (
              <li key={item.step} className="flex gap-4">
                {/* Badge + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--accent-primary-dim)",
                      border: "1px solid rgba(0,200,212,0.3)",
                      color: "var(--accent-primary)",
                    }}>
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div
                      className="mt-1 w-px flex-1"
                      style={{
                        backgroundColor: "var(--border-default)",
                        minHeight: "1.5rem",
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className={index < 2 ? "pb-5" : ""}>
                  <p
                    className="text-sm font-medium leading-6"
                    style={{ color: "var(--text-secondary)" }}>
                    {item.title}
                  </p>
                  <p
                    className="mt-0.5 text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}>
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          © {new Date().getFullYear()} Ghost AI. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div
            className="h-5 w-5 rounded"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}>
            Ghost AI
          </span>
        </div>

        <SignUp forceRedirectUrl="/editor" signInUrl="/sign-in" />
      </div>
    </main>
  );
}
