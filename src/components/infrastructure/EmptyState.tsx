interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-edge p-12 text-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
