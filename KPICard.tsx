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
      className={`relative p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-card-hover ${colorClass}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>

      {/* Main value */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>

      {/* Sparkline visualization */}
      {sparkline.length > 0 && (
        <div className="mb-3 h-8 flex items-end gap-1">
          {sparkline.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-sm opacity-40 transition-opacity hover:opacity-70 ${
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
        <div className="flex items-center gap-1 text-sm">
          {trend.direction === "up" ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-warning" />
          )}
          <span
            className={trend.direction === "up" ? "text-success" : "text-warning"}
          >
            {trend.direction === "up" ? "+" : ""}
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}
