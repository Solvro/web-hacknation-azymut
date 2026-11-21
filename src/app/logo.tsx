/** Znak Azymutu: tarcza kompasu, trójkąt północy i łuk kąta od północy do igły. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <rect fill="#5841bd" height="32" rx="8" width="32" />
      <circle cx="16" cy="16" fill="none" r="10" stroke="#fff" strokeWidth="2" />
      <path d="M16 8.3 17.5 10.9H14.5Z" fill="#fff" />
      <path
        d="M16 11.6a4.4 4.4 0 0 1 3.11 1.29"
        fill="none"
        stroke="#f2b84b"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path d="M22.5 9.5 17.4 17.4 14.6 14.6Z" fill="#fff" />
      <path d="M12.6 19.4 17.4 17.4 14.6 14.6Z" fill="#c9bff5" />
      <circle cx="16" cy="16" fill="#5841bd" r="1.1" />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <>
      <LogoMark size={size} /> Azymut
    </>
  );
}
