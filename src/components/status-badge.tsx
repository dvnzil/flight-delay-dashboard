const VARIANTS = {
  delayed: "bg-delayed/15 text-delayed border-delayed/40",
  ontime: "bg-ontime/15 text-ontime border-ontime/40",
  cancelled: "bg-cancelled/15 text-cancelled-foreground/70 border-cancelled/40",
} as const;

export function StatusBadge({ status }: { status: keyof typeof VARIANTS }) {
  const label = status === "delayed" ? "Delayed" : status === "cancelled" ? "Cancelled" : "On time";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider ${VARIANTS[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
