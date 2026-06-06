import type { Metadata } from "next";
import { Mail, MessageCircle, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Azora FX for support, billing, partnerships, and onboarding.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#080B11] px-4 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00D68F]">Contact Azora FX</p>
          <h1 className="mt-3 text-4xl font-semibold">Talk to the team</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Questions about Pro, payments, prop firm tracking, or onboarding? Send a message and we will get back to you.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Name" name="name" />
              <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Email" name="email" type="email" />
            </div>
            <input className="mt-4 h-11 w-full rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Subject" name="subject" />
            <textarea className="mt-4 min-h-40 w-full rounded-xl border border-white/[0.06] bg-[#141820] p-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Message" name="message" />
            <button className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-[#00D68F] px-5 text-sm font-semibold text-black" type="submit">
              <Send className="h-4 w-4" />
              Submit
            </button>
          </form>

          <aside className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
            <h2 className="text-xl font-semibold">Direct contact</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <a className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#141820] p-3 transition hover:border-[#00D68F]/30" href="mailto:admin@azoraglobal.com">
                <Mail className="h-5 w-5 text-[#00D68F]" />
                <span>Email: admin@azoraglobal.com</span>
              </a>
              <a className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#141820] p-3 transition hover:border-[#00D68F]/30" href="https://wa.me/923099500334" rel="noreferrer" target="_blank">
                <MessageCircle className="h-5 w-5 text-[#00D68F]" />
                <span>WhatsApp: +92 3099500334</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
