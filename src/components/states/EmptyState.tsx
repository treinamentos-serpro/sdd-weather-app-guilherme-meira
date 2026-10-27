interface EmptyStateProps {
  title: string;
  tip: string;
}

export default function EmptyState({ title, tip }: EmptyStateProps) {
  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md"
      role="status"
    >
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{tip}</p>
    </section>
  );
}
