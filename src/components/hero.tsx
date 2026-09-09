"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CountUp } from "@/components/count-up";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
  const [flightCount, setFlightCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("flights")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (!cancelled) setFlightCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-6 py-16 sm:py-24">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-delayed">
        <span className="size-1.5 rounded-full bg-delayed animate-pulse" />
        BTS on-time performance · Jan 2024
      </div>
      <h1 className="font-heading text-5xl sm:text-7xl font-semibold tracking-tight text-balance max-w-3xl uppercase leading-[0.95]">
        Where flights actually run late, and why.
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        A look at U.S. domestic flights from January 2024 — which airports and
        airlines run behind schedule, when it happens, and what&apos;s causing it.
      </p>
      <div className="flex items-baseline gap-3 pt-2">
        {flightCount === null ? (
          <Skeleton className="h-12 w-40" />
        ) : (
          <span className="font-heading text-5xl font-bold tabular-nums text-foreground">
            <CountUp target={flightCount} />
          </span>
        )}
        <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
          flights analyzed
        </span>
      </div>
    </section>
  );
}
