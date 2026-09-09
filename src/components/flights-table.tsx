"use client";

import { useEffect, useState } from "react";
import { supabase, type Flight } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";

const PAGE_SIZE = 25;
const MAX_DELAY = 300;

export function FlightsTable({
  selectedAirport,
  onSelectAirport,
}: {
  selectedAirport: string | null;
  onSelectAirport: (code: string | null) => void;
}) {
  const [airlines, setAirlines] = useState<{ code: string; name: string }[]>([]);
  const [airports, setAirports] = useState<{ code: string; name: string }[]>([]);
  const [airlineFilter, setAirlineFilter] = useState<string>("all");
  const [delayRange, setDelayRange] = useState<[number, number]>([0, MAX_DELAY]);
  const [page, setPage] = useState(0);
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("delay_cause_by_airline")
      .select("airline_code, airline_name")
      .order("airline_code")
      .then(({ data }) => {
        setAirlines((data ?? []).map((d) => ({ code: d.airline_code, name: d.airline_name })));
      });
    supabase
      .from("airports")
      .select("iata_code, name")
      .order("iata_code")
      .then(({ data }) => {
        setAirports((data ?? []).map((a) => ({ code: a.iata_code, name: a.name })));
      });
  }, []);

  useEffect(() => {
    setPage(0);
  }, [airlineFilter, delayRange, selectedAirport]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setFlights(null);
      let query = supabase
        .from("flights")
        .select(
          "id, flight_date, airline_code, airline_name, origin_airport, dest_airport, dep_delay_minutes, arr_delay_minutes, carrier_delay, weather_delay, nas_delay, security_delay, late_aircraft_delay, cancelled, distance",
          { count: "exact" }
        )
        .order("flight_date", { ascending: false });

      if (airlineFilter !== "all") query = query.eq("airline_code", airlineFilter);
      if (selectedAirport) query = query.eq("origin_airport", selectedAirport);
      if (delayRange[0] > 0) query = query.gte("arr_delay_minutes", delayRange[0]);
      if (delayRange[1] < MAX_DELAY) query = query.lte("arr_delay_minutes", delayRange[1]);

      query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setFlights(data ?? []);
      setTotalCount(count ?? 0);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [airlineFilter, delayRange, page, selectedAirport]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Airline</label>
          <Select value={airlineFilter} onValueChange={(v) => setAirlineFilter(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All airlines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All airlines</SelectItem>
              {airlines.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Origin airport</label>
          <Select
            value={selectedAirport ?? "all"}
            onValueChange={(v) => onSelectAirport(v === "all" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All airports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All airports</SelectItem>
              {airports.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[280px] flex-1 max-w-sm">
          <label className="text-xs font-medium text-muted-foreground">
            Arrival delay: {delayRange[0]} to {delayRange[1] === MAX_DELAY ? `${MAX_DELAY}+` : delayRange[1]} min
          </label>
          <Slider
            min={0}
            max={MAX_DELAY}
            step={5}
            value={delayRange}
            onValueChange={(v) => {
              if (Array.isArray(v)) setDelayRange([v[0], v[1]]);
            }}
          />
        </div>

        {selectedAirport && (
          <Badge variant="secondary" className="h-fit">
            Origin: {selectedAirport}
          </Badge>
        )}
      </div>

      {error && <div className="text-sm text-destructive">Couldn&apos;t load flights: {error}</div>}

      {!error && flights === null && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!error && flights !== null && flights.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No flights match these filters. Try widening the delay range or choosing a different airline.
        </div>
      )}

      {!error && flights !== null && flights.length > 0 && (
        <div
          key={`${page}-${airlineFilter}-${selectedAirport}-${delayRange.join(",")}`}
          className="rounded-lg border overflow-x-auto animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Dep Delay</TableHead>
                <TableHead className="text-right">Arr Delay</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {flights.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.flight_date}</TableCell>
                  <TableCell className="font-sans">{f.airline_name}</TableCell>
                  <TableCell>
                    {f.origin_airport} → {f.dest_airport}
                  </TableCell>
                  <TableCell className="text-right">{f.dep_delay_minutes ?? "—"}</TableCell>
                  <TableCell className="text-right">{f.arr_delay_minutes ?? "—"}</TableCell>
                  <TableCell className="text-right">{f.distance ?? "—"}</TableCell>
                  <TableCell>
                    {f.cancelled ? (
                      <StatusBadge status="cancelled" />
                    ) : (f.arr_delay_minutes ?? 0) > 15 ? (
                      <StatusBadge status="delayed" />
                    ) : (
                      <StatusBadge status="ontime" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!error && totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalCount.toLocaleString()} flights — page {page + 1} of {totalPages.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-40"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
