import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Azora FX trading psychology, journaling, and prop firm education.",
};

export default function BlogPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B11] px-4 py-20 text-white">
      <section className="w-full max-w-2xl rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-8 text-center shadow-[0_0_40px_rgba(0,214,143,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00D68F]/25 bg-[#00D68F]/10 text-[#00D68F]">
          <BookOpen className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D68F]">Azora FX Blog</p>
        <h1 className="mt-3 text-4xl font-semibold">Coming Soon</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          Practical guides on trading psychology, prop firm rules, journaling discipline, and data-driven performance are on the way.
        </p>
        <Link className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#00D68F] px-5 text-sm font-semibold text-black" href="/">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

