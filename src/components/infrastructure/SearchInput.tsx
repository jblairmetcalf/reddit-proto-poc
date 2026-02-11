"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  resultCount,
}: SearchInputProps) {
  const query = value.trim();

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-edge-strong bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
      />
      {query && resultCount !== undefined && (
        <p className="mt-2 text-xs text-muted">
          {resultCount} result{resultCount !== 1 ? "s" : ""} for
          &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
