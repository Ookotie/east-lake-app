import { cn } from "@/lib/utils";

export function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color =
    score >= 50 ? "bg-emerald-500" :
    score >= 40 ? "bg-blue-500" :
    score >= 30 ? "bg-amber-500" :
    "bg-red-400";

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div className={cn(
      "rounded-full text-white font-bold flex items-center justify-center shadow-md",
      color, sizes[size]
    )}>
      {Math.round(score)}
    </div>
  );
}
