import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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

        {/* Tagline + Features */}
        <div className="space-y-10">
          <div>
            <h2
              className="text-2xl font-semibold tracking-tight leading-snug"
              style={{ color: "var(--text-primary)" }}>
              Design systems at the
              <br />
              speed of thought.
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}>
              Describe your architecture in plain English. Ghost AI maps it to a
              shared canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{
                  backgroundColor: "var(--accent-primary-dim)",
                  border: "1px solid rgba(0,200,212,0.25)",
                }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 6v6l4 2" />
                  <circle
                    cx="18"
                    cy="6"
                    r="3"
                    fill="var(--accent-primary)"
                    stroke="none"
                  />
                  <path
                    d="M15.5 4.5 18 6l-1.5 2"
                    stroke="var(--bg-base)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}>
                  AI Architecture Generation
                </p>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}>
                  Describe your system, AI maps it to nodes and edges on a live
                  canvas.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{
                  backgroundColor: "var(--accent-primary-dim)",
                  border: "1px solid rgba(0,200,212,0.25)",
                }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="9" cy="12" r="3" />
                  <circle cx="17" cy="7" r="2" />
                  <circle cx="17" cy="17" r="2" />
                  <path d="M11.8 10.6 15.2 8.4M11.8 13.4l3.4 2.2" />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}>
                  Real-time Collaboration
                </p>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}>
                  Live cursors, presence indicators, and shared node editing
                  across your team.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{
                  backgroundColor: "var(--accent-primary-dim)",
                  border: "1px solid rgba(0,200,212,0.25)",
                }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}>
                  Instant Spec Generation
                </p>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}>
                  Export a complete Markdown technical spec directly from the
                  canvas graph.
                </p>
              </div>
            </li>
          </ul>
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

        <SignIn forceRedirectUrl="/editor" signUpUrl="/sign-up" />
      </div>
    </main>
  );
}
