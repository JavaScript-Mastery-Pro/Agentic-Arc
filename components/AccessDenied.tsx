import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950/80">
          <Lock className="h-8 w-8 text-cyan-300" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Access Denied
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          You need to be invited to view this architecture.
        </p>

        <div className="mt-8">
          <Link href="/editor">
            <Button type="button" variant="secondary" className="rounded-xl">
              Go to editor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
