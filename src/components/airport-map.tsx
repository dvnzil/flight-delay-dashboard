"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { supabase, type Airport, type AirportDelaySummary } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

type AirportPoint = AirportDelaySummary & Pick<Airport, "name" | "city" | "state" | "lat" | "lon">;

function delayColor(delay: number, min: number, max: number) {
  const t = max === min ? 0.5 : Math.min(1, Math.max(0, (delay - min) / (max - min)));
  // low delay -> blue (good), high delay -> red (bad)
  const r = Math.round(59 + t * (220 - 59));
  const g = Math.round(130 + t * (38 - 130));
  const b = Math.round(246 + t * (38 - 246));
  return `rgb(${r},${g},${b})`;
}

export function AirportMap({
  selectedAirport,
  onSelectAirport,
}: {
  selectedAirport: string | null;
  onSelectAirport: (code: string | null) => void;
}) {
  const [points, setPoints] = useState<AirportPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: summary, error: summaryErr }, { data: airports, error: airportsErr }] =
        await Promise.all([
          supabase.from("airport_delay_summary").select("*"),
          supabase.from("airports").select("iata_code, name, city, state, lat, lon"),
        ]);
      if (cancelled) return;
      if (summaryErr || airportsErr) {
        setError(summaryErr?.message ?? airportsErr?.message ?? "Failed to load map data");
        return;
      }
      const airportMap = new Map((airports ?? []).map((a) => [a.iata_code, a]));
      const merged: AirportPoint[] = (summary ?? [])
        .map((s) => {
          const a = airportMap.get(s.origin_airport);
          if (!a) return null;
          return { ...s, name: a.name, city: a.city, state: a.state, lat: a.lat, lon: a.lon };
        })
        .filter((p): p is AirportPoint => p !== null);
      setPoints(merged);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="text-sm text-destructive">Couldn&apos;t load airport map: {error}</div>;
  }

  if (!points) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

  const delays = points.map((p) => p.avg_delay ?? 0);
  const min = Math.min(...delays);
  const max = Math.max(...delays);
  const counts = points.map((p) => p.flight_count);
  const maxCount = Math.max(...counts);

  return (
    <div className="w-full">
      <ComposableMap projection="geoAlbersUsa" className="w-full h-[500px]">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--muted)"
                stroke="var(--border)"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        {points.map((p) => {
          const radius = 3 + 9 * Math.sqrt((p.flight_count ?? 0) / (maxCount || 1));
          const isSelected = selectedAirport === p.origin_airport;
          return (
            <Marker
              key={p.origin_airport}
              coordinates={[p.lon, p.lat]}
              onClick={() => onSelectAirport(isSelected ? null : p.origin_airport)}
              style={{ default: { cursor: "pointer" } }}
            >
              <circle
                r={radius}
                fill={delayColor(p.avg_delay ?? 0, min, max)}
                stroke={isSelected ? "var(--foreground)" : "white"}
                strokeWidth={isSelected ? 2 : 0.75}
                fillOpacity={0.85}
              />
              <title>
                {p.name} ({p.origin_airport}) — {p.flight_count.toLocaleString()} flights, avg delay{" "}
                {(p.avg_delay ?? 0).toFixed(1)} min
              </title>
            </Marker>
          );
        })}
      </ComposableMap>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>Bubble size = flight volume</span>
        <div className="flex items-center gap-2">
          <span>Less delay</span>
          <div
            className="h-2 w-32 rounded-full"
            style={{ background: "linear-gradient(to right, rgb(59,130,246), rgb(220,38,38))" }}
          />
          <span>More delay</span>
        </div>
      </div>
    </div>
  );
}
