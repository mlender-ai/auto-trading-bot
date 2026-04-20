import { formatCurrency, formatPercent } from "../lib/format";

interface MetricCardProps {
  label: string;
  value: number;
  tone?: "positive" | "negative" | "neutral";
  format?: "currency" | "percent" | "number";
}

export function MetricCard({ label, value, tone = "neutral", format = "currency" }: MetricCardProps) {
  const display =
    format === "percent" ? formatPercent(value) : format === "number" ? value.toString() : formatCurrency(value);

  return (
    <article className={`panel metric metric-${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{display}</p>
    </article>
  );
}

