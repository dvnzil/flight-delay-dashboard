import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AirportDelaySummary = {
  origin_airport: string;
  flight_count: number;
  avg_delay: number | null;
  avg_carrier_delay: number | null;
  avg_weather_delay: number | null;
  avg_nas_delay: number | null;
};

export type DailyDelaySummary = {
  flight_date: string;
  flight_count: number;
  avg_delay: number | null;
  cancellations: number;
};

export type Airport = {
  iata_code: string;
  name: string;
  city: string | null;
  state: string | null;
  lat: number;
  lon: number;
};

export type Flight = {
  id: number;
  flight_date: string;
  airline_code: string;
  airline_name: string;
  origin_airport: string;
  dest_airport: string;
  dep_delay_minutes: number | null;
  arr_delay_minutes: number | null;
  carrier_delay: number | null;
  weather_delay: number | null;
  nas_delay: number | null;
  security_delay: number | null;
  late_aircraft_delay: number | null;
  cancelled: number;
  distance: number | null;
};
