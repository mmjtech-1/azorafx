"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setMessage("");

    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setIsLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-foreground-primary">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">
          Sign in to continue your trading workflow.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleEmailSignIn}>
        <label className="block">
          <span className="text-sm font-medium text-foreground-secondary">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none transition placeholder:text-foreground-tertiary focus:border-border-accent focus:ring-2 focus:ring-accent/10"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground-secondary">Password</span>
          <input
            className="mt-2 h-11 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none transition placeholder:text-foreground-tertiary focus:border-border-accent focus:ring-2 focus:ring-accent/10"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        <div className="flex justify-end">
          <Link className="text-sm font-medium text-accent hover:text-[#00F0A0]" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {message ? <p className="text-sm text-loss">{message}</p> : null}

        <button
          className="h-11 w-full rounded-[10px] bg-accent px-4 text-sm font-semibold text-black transition hover:bg-[#00F0A0] hover:shadow-accent disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        className="mt-3 h-11 w-full rounded-[10px] border border-border-strong bg-transparent px-4 text-sm font-medium text-foreground-secondary transition hover:border-border-accent hover:text-foreground-primary disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-foreground-secondary">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-accent hover:text-[#00F0A0]" href="/register">
          Register
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-[16px] bg-[#141820]" />}>
      <LoginForm />
    </Suspense>
  );
}
