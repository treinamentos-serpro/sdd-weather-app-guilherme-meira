interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-300/20 bg-white/5 p-5 shadow-glass backdrop-blur-md">
      <p className="text-white/85" role="alert">
        {message}
      </p>
      <button
        className="mt-4 min-h-11 rounded-lg bg-accent-400 px-4 py-2 font-semibold text-night-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
