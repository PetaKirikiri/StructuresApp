export function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6.5 6.5h11" />
      <path d="M6.5 17.5h11" />
      <path d="M4 8v8" />
      <path d="M7 10v4" />
      <path d="M17 10v4" />
      <path d="M20 8v8" />
    </svg>
  )
}
