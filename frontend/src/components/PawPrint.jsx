export default function PawPrint({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 44"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 23c8 0 11 8 9 13-2 4-6 3-9 3s-7 1-9-3c-2-5 1-13 9-13Z" />
      <ellipse cx="6.5" cy="20" rx="2.8" ry="5.2" transform="rotate(-38 6.5 20)" />
      <ellipse cx="12" cy="11.5" rx="2.8" ry="5.6" transform="rotate(-16 12 11.5)" />
      <ellipse cx="20" cy="8" rx="2.9" ry="5.8" />
      <ellipse cx="28" cy="11.5" rx="2.8" ry="5.6" transform="rotate(16 28 11.5)" />
      <ellipse cx="33.5" cy="20" rx="2.8" ry="5.2" transform="rotate(38 33.5 20)" />
    </svg>
  );
}
