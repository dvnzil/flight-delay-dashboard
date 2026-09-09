"use client";

import { useEffect, useState } from "react";
import { supabase, type DailyDelaySummary } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { delayIntensityColor, DELAYED_HEX, BASE_HEX } from "@/lib/status-colors";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarHeatmap() {
  const [rows, setRows] = useState<DailyDelaySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("daily_delay_summary")
        .select("*")
        .order("flight_date", { ascending: true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setRows(data ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="text-sm text-destructive">Couldn&apos;t load daily summary: {error}</div>;
  }

  if (!rows) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No daily data available.</div>;
  }

  const delays = rows.map((r) => r.avg_delay ?? 0);
  const min = Math.min(...delays);
  const max = Math.max(...delays);

  const byMonth = new Map<string, DailyDelaySummary[]>();
  for (const r of rows) {
    const d = new Date(r.flight_date + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(r);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-0 duration-500">
      {Array.from(byMonth.entries()).map(([key, days]) => {
        const [, monthIdx] = key.split("-").map(Number);
        return (
          <div key={key}>
            <div className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-2">
              {MONTH_NAMES[monthIdx]}
            </div>
            <div className="grid grid-cols-7 gap-1.5 max-w-md">
              {days.map((d) => {
                const day = new Date(d.flight_date + "T00:00:00").getDate();
                return (
                  <div
                    key={d.flight_date}
                    className="aspect-square rounded-sm flex items-center justify-center text-[10px] font-mono text-white/90 transition-transform hover:scale-110"
                    style={{ background: delayIntensityColor(d.avg_delay ?? 0, min, max) }}
                    title={`${d.flight_date}: avg delay ${(d.avg_delay ?? 0).toFixed(1)} min, ${d.flight_count.toLocaleString()} flights, ${d.cancellations} cancelled`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span>Less delay</span>
        <div
          className="h-1.5 w-32 rounded-full"
          style={{ background: `linear-gradient(to right, ${BASE_HEX}, ${DELAYED_HEX})` }}
        />
        <span>More delay</span>
      </div>
    </div>
  );
}
