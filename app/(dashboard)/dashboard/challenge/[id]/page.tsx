"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChallengeDetail } from "@/components/challenge/ChallengeDetail";
import { useChallenge } from "@/hooks/useChallenges";

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const query = useChallenge(params.id);

  if (query.isLoading) {
    return <div className="h-[620px] animate-pulse rounded-[16px] border border-border bg-background-secondary" />;
  }

  if (!query.data) {
    return (
      <div className="rounded-[16px] border border-border bg-background-secondary p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Challenge not found</h1>
        <Link className="mt-4 inline-flex text-sm font-semibold text-[#00D68F]" href="/dashboard/challenge">Back to challenges</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-secondary transition hover:text-white" href="/dashboard/challenge">
        <ArrowLeft className="h-4 w-4" /> Back to challenges
      </Link>
      <ChallengeDetail challenge={query.data} />
    </div>
  );
}
