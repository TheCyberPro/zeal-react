export default function Logo({ className = '' }) {
  return (
    <svg
      className={`logo ${className}`.trim()}
      viewBox="0 0 76 26"
      role="img"
      aria-label="Zeal"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9H15L3 23H15" />
      <path d="M23 16H37A7 7 0 1 0 35 21" />
      <path d="M58 16A7 7 0 1 0 44 16A7 7 0 1 0 58 16M58 9V23" />
      <path d="M66 3V23" />
      <circle cx="72.5" cy="22" r="2.1" stroke="none" style={{ fill: 'var(--accent, #5b6cff)' }} />
    </svg>
  );
}