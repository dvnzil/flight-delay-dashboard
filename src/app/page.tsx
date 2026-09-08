"use client";

import { useState } from "react";
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

export default function Home() {
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <Hero />

      <div className="flex flex-col gap-8 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>Delay by airport</CardTitle>
            <CardDescription>
              Click an airport to filter the flight table below to flights departing from it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AirportMap selectedAirport={selectedAirport} onSelectAirport={setSelectedAirport} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delay by day</CardTitle>
            <CardDescription>
              Daily average arrival delay across January and July 2024, showing seasonal patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarHeatmap />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What&apos;s causing the delays</CardTitle>
            <CardDescription>
              Average delay minutes by cause, broken down by airline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DelayBreakdownChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Individual flights</CardTitle>
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
