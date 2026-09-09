"use client";

import { useCallback, useRef, useState } from "react";
import { Hero } from "@/components/hero";
import { AirportMap } from "@/components/airport-map";
import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { DelayBreakdownChart } from "@/components/delay-breakdown-chart";
import { FlightsTable } from "@/components/flights-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SECTION_TITLE = "font-heading text-2xl uppercase tracking-wide";

export default function Home() {
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const flightsRef = useRef<HTMLDivElement>(null);

  const handleSelectFromMap = useCallback((code: string | null) => {
    setSelectedAirport(code);
    if (code) {
      flightsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <Hero />

      <div className="flex flex-col gap-8 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className={SECTION_TITLE}>01 · Delay by airport</CardTitle>
            <CardDescription>
              Click an airport to filter the flight table below to flights departing from it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AirportMap selectedAirport={selectedAirport} onSelectAirport={handleSelectFromMap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={SECTION_TITLE}>02 · Delay by day</CardTitle>
            <CardDescription>
              Daily average arrival delay across January 2024.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarHeatmap />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={SECTION_TITLE}>03 · What&apos;s causing the delays</CardTitle>
            <CardDescription>
              Average delay minutes by cause, broken down by airline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DelayBreakdownChart />
          </CardContent>
        </Card>

        <Card ref={flightsRef}>
          <CardHeader>
            <CardTitle className={SECTION_TITLE}>04 · Individual flights</CardTitle>
            <CardDescription>Filter and browse flight-level records.</CardDescription>
          </CardHeader>
          <CardContent>
            <FlightsTable selectedAirport={selectedAirport} onSelectAirport={setSelectedAirport} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
