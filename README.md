# Flight Delay Dashboard

Where flights actually run late, and why. A look at 547K U.S. domestic
flights from January 2024, built from the BTS (Bureau of Transportation
Statistics) on-time performance dataset, exploring which airports and
airlines run behind schedule, when it happens, and what's causing it.

Built with Next.js (App Router), TypeScript, Tailwind, shadcn/ui, and
Supabase (Postgres).

## What's on the page

1. **Delay by airport** — a US map (react-simple-maps) plotting every
   airport, sized by flight volume and colored by average arrival delay.
   Click an airport to filter the flight table below to departures from it.
2. **Delay by day** — a calendar heatmap of January 2024, colored by daily
   average arrival delay. The mid-month red spike (Jan 15–16) is the winter
   storm that grounded a large share of the network that week.
3. **What's causing the delays** — a stacked bar chart (recharts) breaking
   down average delay minutes by cause (carrier, weather, NAS, security,
   late aircraft) per airline.
4. **Individual flights** — a paginated, filterable table of flight-level
   records (airline, origin airport, arrival delay range), querying Supabase
   with `.range()` rather than pulling the whole table.

## Data pipeline

```
BTS "Flight Data 2024" CSV (1.3GB, ~7M rows)
  -> scripts/prep_data.py
     · filter to January 2024
     · join against OpenFlights airports.dat for lat/lon/name
     -> data/flights.csv, data/airports.csv
  -> scripts/setup_db.py
     · create airports/flights tables + indexes on Supabase Postgres
     · bulk-load both CSVs via COPY (chunked to stay under the
       connection pooler's statement timeout)
  -> scripts/materialize_views.py
     · convert the three summary views to MATERIALIZED VIEWS
       (airport_delay_summary, daily_delay_summary, delay_cause_by_airline)
     · add indexes + explicit grants for the anon/PostgREST role
     · REFRESH each view once
  -> Next.js site queries only the materialized views (or the flights
     table with .range() pagination) via the Supabase JS client and the
     anon/publishable key — never an unbounded select on raw flights.
```

The three summary views are materialized (pre-computed) rather than plain
views because PostgREST's anon-role connection has a short statement
timeout, and re-aggregating hundreds of thousands of rows on every page
load blew past it. Materializing means the aggregation runs once (on
refresh), and every subsequent read is a fast indexed lookup.

## Database schema

- `airports(iata_code pk, name, city, state, lat, lon)`
- `flights(id pk, flight_date, airline_code, airline_name, origin_airport fk, dest_airport fk, dep_delay_minutes, arr_delay_minutes, carrier_delay, weather_delay, nas_delay, security_delay, late_aircraft_delay, cancelled, distance)`
  with indexes on `origin_airport`, `flight_date`, `airline_code`
- `airport_delay_summary` (materialized) — one row per origin airport
- `daily_delay_summary` (materialized) — one row per flight date
- `delay_cause_by_airline` (materialized) — one row per airline

## Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

To rebuild the database from scratch, run the scripts in `../scripts/` in
order (`prep_data.py` → `setup_db.py` → `materialize_views.py`), each with
`SUPABASE_DB_PASSWORD` set in the environment.
