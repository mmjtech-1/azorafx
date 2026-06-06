"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setIsSuccess(true);
    setMessage("Reset link sent. Check your email for next steps.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-foreground-primary">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">
          Enter your email and we&apos;ll send a secure reset link.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
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

        {message ? (
          <p className={`text-sm ${isSuccess ? "text-accent" : "text-loss"}`}>{message}</p>
        ) : null}

        <button
          className="h-11 w-full rounded-[10px] bg-accent px-4 text-sm font-semibold text-black transition hover:bg-[#00F0A0] hover:shadow-accent disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-secondary">
        <Link className="font-medium text-accent hover:text-[#00F0A0]" href="/login">
          Back to login
        </Link>
      </p>
    </motion.div>
  );
}
