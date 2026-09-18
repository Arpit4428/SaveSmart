export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/80 shadow-soft-sm transition-all duration-200 ${
        className.includes("p-") ? "" : "p-6 sm:p-7"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-stone-100 mb-5">
      <div>
        <h3 className="font-semibold text-stone-950 text-base tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
