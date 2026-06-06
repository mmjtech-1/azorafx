"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setIsSuccess(true);
    setMessage("Check your email to confirm your account.");
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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
        <h1 className="text-2xl font-semibold text-foreground-primary">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">
          Start tracking your trades with a focused premium workspace.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleRegister}>
        <label className="block">
          <span className="text-sm font-medium text-foreground-secondary">Full name</span>
          <input
            className="mt-2 h-11 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none transition placeholder:text-foreground-tertiary focus:border-border-accent focus:ring-2 focus:ring-accent/10"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Muhammad Mouazam"
            required
          />
        </label>

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
            placeholder="Create a password"
            minLength={6}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground-secondary">Confirm password</span>
          <input
            className="mt-2 h-11 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none transition placeholder:text-foreground-tertiary focus:border-border-accent focus:ring-2 focus:ring-accent/10"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            minLength={6}
            required
          />
        </label>

        {message ? (
          <p className={`text-sm ${isSuccess ? "text-accent" : "text-loss"}`}>{message}</p>
        ) : null}

        <button
          className="h-11 w-full rounded-[10px] bg-accent px-4 text-sm font-semibold text-black transition hover:bg-[#00F0A0] hover:shadow-accent disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <Link className="font-medium text-accent hover:text-[#00F0A0]" href="/login">
          Login
        </Link>
      </p>
    </motion.div>
  );
}
