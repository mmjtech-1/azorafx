"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { EmotionPicker } from "@/components/journal/EmotionPicker";
import { UpgradeModal } from "@/components/journal/UpgradeModal";
import { useCreateTrade } from "@/hooks/useTrades";
import { calculateRiskReward, tradeCreateSchema, type TradeInput } from "@/types/trades";

const pairs = ["EURUSD", "GBPUSD", "GBPJPY", "USDJPY", "XAUUSD", "XAGUSD", "BTCUSD", "ETHUSD", "USOIL", "NAS100"];
const sessions = [
  ["asian", "Asian"],
  ["london", "London"],
  ["new_york", "New York"],
  ["overlap", "Overlap"],
  ["pre_market", "Pre-Market"],
] as const;
const setups = [
  ["ema_crossover", "EMA Crossover"],
  ["structure_break", "Structure Break"],
  ["ob_retest", "OB Retest"],
  ["news_trade", "News Trade"],
  ["supply_demand", "Supply & Demand"],
  ["fib_retracement", "Fib Retracement"],
  ["trendline_break", "Trendline Break"],
  ["other", "Other"],
] as const;

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary";
const inputClass =
  "mt-2 h-10 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none transition placeholder:text-foreground-tertiary focus:border-[#00D68F]";

function nowForInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function TradeLogForm({
  tradesThisMonth,
}: {
  tradesThisMonth: number;
}) {
  const searchParams = useSearchParams();
  const { user, subscription } = useDashboard();
  const createTrade = useCreateTrade();
  const [customPair, setCustomPair] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<TradeInput>({
    resolver: zodResolver(tradeCreateSchema),
    defaultValues: {
      pair: "EURUSD",
      direction: "long",
      session: "london",
      setup_type: "other",
      entry_price: 1,
      outcome: "open",
      opened_at: new Date(nowForInput()).toISOString(),
      tags: [],
      screenshot_urls: [],
    },
  });

  useEffect(() => {
    const pair = searchParams.get("pair");
    const direction = searchParams.get("direction");
    const entry = searchParams.get("entry");
    const sl = searchParams.get("sl");
    const tp = searchParams.get("tp");

    if (pair) form.setValue("pair", pair.toUpperCase());
    if (direction === "long" || direction === "short") form.setValue("direction", direction);
    if (entry) form.setValue("entry_price", Number(entry));
    if (sl) form.setValue("stop_loss", Number(sl));
    if (tp) form.setValue("take_profit", Number(tp));
  }, [form, searchParams]);

  const watched = form.watch();
  const riskReward = useMemo(() => calculateRiskReward(watched), [watched]);
  const riskAmount = ((Number(watched.risk_percent) || 0) / 100) * 10000;
  const potentialProfit = (riskReward ?? 0) * riskAmount;
  const tags = form.watch("tags") ?? [];

  async function uploadFiles(files: FileList | File[]) {
    const supabase = createClient();
    const selected = Array.from(files);
    const urls: string[] = [];

    for (const file of selected) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from("trade-screenshots").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    setUploads((current) => [...current, ...urls]);
    form.setValue("screenshot_urls", [...uploads, ...urls], { shouldDirty: true });
  }

  async function onSubmit(input: TradeInput) {
    setError("");

    if (subscription.plan !== "pro" && tradesThisMonth >= 20) {
      setShowUpgrade(true);
      return;
    }

    const pair = input.pair === "CUSTOM" ? customPair.trim().toUpperCase() : input.pair;
    if (!pair) {
      setError("Enter a custom pair.");
      return;
    }

    try {
      await createTrade.mutateAsync({
        ...input,
        pair,
        risk_reward: riskReward,
        risk_amount: riskAmount || null,
        screenshot_urls: uploads,
      });
      form.reset({
        ...form.getValues(),
        pair: "EURUSD",
        opened_at: new Date(nowForInput()).toISOString(),
        notes: "",
        mistakes: "",
        lessons: "",
        tags: [],
        screenshot_urls: [],
      });
      setUploads([]);
      setCustomPair("");
    } catch (submitError) {
      if (submitError instanceof Error && submitError.message.includes("limit")) {
        setShowUpgrade(true);
      } else {
        setError(submitError instanceof Error ? submitError.message : "Unable to log trade.");
      }
    }
  }

  function addTag() {
    const next = tagInput.trim().replace(/^#/, "");
    if (!next || tags.includes(next)) return;
    form.setValue("tags", [...tags, next], { shouldDirty: true });
    setTagInput("");
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[16px] border border-border bg-background-secondary p-5"
    >
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <h2 className="text-lg font-semibold text-foreground-primary">Log New Trade</h2>
      <form className="mt-5 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 border-b border-border pb-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Pair</span>
            <input className={inputClass} list="pairs" {...form.register("pair")} />
            <datalist id="pairs">
              {pairs.map((pair) => (
                <option key={pair} value={pair} />
              ))}
              <option value="CUSTOM" />
            </datalist>
          </label>
          {watched.pair === "CUSTOM" ? (
            <label>
              <span className={labelClass}>Custom Pair</span>
              <input className={inputClass} value={customPair} onChange={(event) => setCustomPair(event.target.value)} />
            </label>
          ) : null}
          <div>
            <span className={labelClass}>Direction</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["long", "short"] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => form.setValue("direction", direction)}
                  className={`h-10 rounded-[10px] border text-sm font-semibold ${
                    watched.direction === direction
                      ? direction === "long"
                        ? "border-border-accent bg-accent-subtle text-accent"
                        : "border-loss/40 bg-loss/10 text-loss"
                      : "border-border bg-[#141820] text-foreground-secondary"
                  }`}
                >
                  {direction.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className={labelClass}>Session</span>
            <select className={inputClass} {...form.register("session")}>
              {sessions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Setup Type</span>
            <select className={inputClass} {...form.register("setup_type")}>
              {setups.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 border-b border-border pb-5 sm:grid-cols-2">
          {[
            ["entry_price", "Entry Price"],
            ["stop_loss", "Stop Loss"],
            ["take_profit", "Take Profit"],
            ["lot_size", "Lot Size"],
            ["risk_percent", "Risk %"],
          ].map(([name, label]) => (
            <label key={name}>
              <span className={labelClass}>{label}</span>
              <input className={inputClass} step="any" type="number" {...form.register(name as keyof TradeInput)} />
            </label>
          ))}
          <label>
            <span className={labelClass}>Opened At</span>
            <input
              className={inputClass}
              type="datetime-local"
              defaultValue={nowForInput()}
              onChange={(event) => form.setValue("opened_at", new Date(event.target.value).toISOString())}
            />
          </label>
        </div>

        <div className="border-b border-border pb-5">
          <span className={labelClass}>Pre-trade Emotion</span>
          <div className="mt-2">
            <Controller
              control={form.control}
              name="pre_emotion"
              render={({ field }) => <EmotionPicker value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        <div className="grid gap-4 border-b border-border pb-5">
          {(["notes", "mistakes", "lessons"] as const).map((name) => (
            <label key={name}>
              <span className={labelClass}>{name}</span>
              <textarea className={`${inputClass} min-h-20 py-3`} {...form.register(name)} />
            </label>
          ))}
          <div>
            <span className={labelClass}>Tags</span>
            <div className="mt-2 flex flex-wrap gap-2 rounded-[10px] border border-border bg-[#141820] p-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-1 text-xs text-accent"
                  onClick={() => form.setValue("tags", tags.filter((item) => item !== tag))}
                >
                  #{tag} <X className="h-3 w-3" />
                </button>
              ))}
              <input
                className="min-w-24 flex-1 bg-transparent text-sm outline-none"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type tag"
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-[12px] border border-dashed border-border bg-[#141820] p-4 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            uploadFiles(event.dataTransfer.files);
          }}
        >
          <UploadCloud className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 text-sm text-foreground-secondary">Drag screenshots here or click to upload</p>
          <input
            className="mt-3 text-sm text-foreground-secondary"
            multiple
            type="file"
            accept="image/*"
            onChange={(event) => event.target.files && uploadFiles(event.target.files)}
          />
          {uploads.length ? <p className="mt-2 text-xs text-accent">{uploads.length} uploaded</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[12px] border border-border bg-background-tertiary p-3 text-sm">
          <div>
            <p className={labelClass}>R:R</p>
            <p className="mt-1 font-semibold text-foreground-primary">{riskReward ? `1:${riskReward.toFixed(2)}` : "-"}</p>
          </div>
          <div>
            <p className={labelClass}>Risk Amount</p>
            <p className="mt-1 font-semibold text-foreground-primary">${riskAmount.toFixed(0)}</p>
          </div>
          <div>
            <p className={labelClass}>Potential Profit</p>
            <p className="mt-1 font-semibold text-accent">${potentialProfit.toFixed(0)}</p>
          </div>
        </div>

        {error ? <p className="text-sm text-loss">{error}</p> : null}

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-semibold text-black transition hover:bg-[#00F0A0]"
          type="submit"
          disabled={createTrade.isPending}
        >
          <Plus className="h-4 w-4" />
          {createTrade.isPending ? "Logging..." : "Log Trade"}
        </button>
      </form>
    </motion.section>
  );
}
