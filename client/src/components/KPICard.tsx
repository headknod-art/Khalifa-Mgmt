import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "primary" | "secondary" | "success" | "warning";
  sparkline?: number[];
}

const colorClasses = {
  primary: "border-primary/30 bg-primary/5 text-primary",
  secondary: "border-secondary/30 bg-secondary/5 text-secondary",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
};

export default function KPICard({
  title,
  value,
  icon,
  trend,
  color = "primary",
  sparkline = [],
}: KPICardProps) {
  const colorClass = colorClasses[color];

  return (
    <div
      className={`relative p-8 rounded-2xl border shadow-lg bg-card/90 backdrop-blur-md ${colorClass}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <p className="text-base font-semibold text-muted-foreground uppercase tracking-widest font-display">
            {title}
          </p>
        </div>
        {icon && <div className="text-3xl opacity-70 drop-shadow-sm">{icon}</div>}
      </div>

      {/* Main value */}
      <div className="mb-6">
        <p className="text-4xl font-extrabold text-foreground font-display tracking-tight">{value}</p>
      </div>

      {/* Sparkline visualization */}
      {sparkline.length > 0 && (
        <div className="mb-4 h-8 flex items-end gap-1">
          {sparkline.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full opacity-50 ${
                color === "primary"
                  ? "bg-primary"
                  : color === "secondary"
                    ? "bg-secondary"
                    : color === "success"
                      ? "bg-success"
                      : "bg-warning"
              }`}
              style={{ height: `${Math.max(20, (val / Math.max(...sparkline)) * 100)}%` }}
            />
          ))}
        </div>
      )}

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-2 text-base mt-2">
          {trend.direction === "up" ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-warning" />
          )}
          <span
            className={trend.direction === "up" ? "text-success font-semibold" : "text-warning font-semibold"}
          >
            {trend.direction === "up" ? "+" : ""}
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}
