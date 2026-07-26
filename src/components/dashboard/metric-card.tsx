import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "teal",
}: Readonly<{
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "teal" | "lime" | "amber" | "slate";
}>) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    lime: "bg-lime-100 text-lime-800",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <article className="card min-h-40 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{helper}</p>
    </article>
  );
}
