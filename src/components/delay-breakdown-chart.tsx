"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

type DelayCauseRow = {
  airline_code: string;
  airline_name: string;
  avg_carrier_delay: number | null;
  avg_weather_delay: number | null;
  avg_nas_delay: number | null;
  avg_security_delay: number | null;
  avg_late_aircraft_delay: number | null;
  flight_count: number;
};

const COLORS = {
  carrier: "#3b82f6",
  weather: "#f59e0b",
  nas: "#8b5cf6",
  security: "#ef4444",
  late_aircraft: "#10b981",
};

export function DelayBreakdownChart() {
  const [rows, setRows] = useState<DelayCauseRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("delay_cause_by_airline")
        .select("*")
        .order("flight_count", { ascending: false });
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
    return <div className="text-sm text-destructive">Couldn&apos;t load delay breakdown: {error}</div>;
  }

  if (!rows) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  const chartData = rows.map((r) => ({
    airline: r.airline_code,
    name: r.airline_name,
    Carrier: Number((r.avg_carrier_delay ?? 0).toFixed(2)),
    Weather: Number((r.avg_weather_delay ?? 0).toFixed(2)),
    NAS: Number((r.avg_nas_delay ?? 0).toFixed(2)),
    Security: Number((r.avg_security_delay ?? 0).toFixed(2)),
    "Late Aircraft": Number((r.avg_late_aircraft_delay ?? 0).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="airline" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} label={{ value: "avg minutes", angle: -90, position: "insideLeft", fontSize: 12 }} />
        <Tooltip
          formatter={(value) => `${value} min`}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.name ?? label}
        />
        <Legend />
        <Bar dataKey="Carrier" stackId="a" fill={COLORS.carrier} />
        <Bar dataKey="Weather" stackId="a" fill={COLORS.weather} />
        <Bar dataKey="NAS" stackId="a" fill={COLORS.nas} />
        <Bar dataKey="Security" stackId="a" fill={COLORS.security} />
        <Bar dataKey="Late Aircraft" stackId="a" fill={COLORS.late_aircraft} />
      </BarChart>
    </ResponsiveContainer>
  );
}
