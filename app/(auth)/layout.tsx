import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B11] px-4 py-10 text-foreground-primary">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
            <div className="relative rounded-full border border-border-accent bg-accent-subtle px-5 py-2 text-sm font-semibold text-accent shadow-accent">
              Azora FX
            </div>
          </div>
        </div>

        <section className="rounded-[16px] border border-border bg-[#0E1117] p-6 shadow-2xl shadow-black/30">
          {children}
        </section>
      </div>
    </main>
  );
}
