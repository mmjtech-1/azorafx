import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B11] px-4 text-center">
      <section>
        <h1 className="text-8xl font-semibold text-[#00D68F]">404</h1>
        <p className="mt-3 text-2xl font-semibold text-white">Page not found</p>
        <p className="mt-2 text-sm text-slate-400">The page you&apos;re looking for isn&apos;t available.</p>
        <Link className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#00D68F] px-5 text-sm font-semibold text-black" href="/dashboard">
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
