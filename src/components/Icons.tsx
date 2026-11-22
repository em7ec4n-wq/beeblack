import React from "react";
import type { ProductSpec } from "@/types/store";

export function TridentLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-label="Getto Deri Logo"
    >
      {/* Trident emblem matching Getto Deri header crown/trident */}
      <path d="M32 6 L37 18 L34 18 L34 38 L46 38 L46 22 L43 22 L49 10 L53 22 L50 22 L50 42 C50 44.2 48.2 46 46 46 L34 46 L34 52 L39 56 L32 60 L25 56 L30 52 L30 46 L18 46 C15.8 46 14 44.2 14 42 L14 22 L11 22 L15 10 L21 22 L18 22 L18 38 L30 38 L30 18 L27 18 Z" />
    </svg>
  );
}

export function SpecIcon({
  type,
  className = "h-6 w-6",
}: {
  type: ProductSpec["icon"];
  className?: string;
}) {
  switch (type) {
    case "height":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="9" y="3" width="6" height="18" rx="1" />
          <line x1="9" y1="7" x2="12" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
          <line x1="9" y1="15" x2="12" y2="15" />
          <path d="M5 5v14M3 7l2-2 2 2M3 17l2 2 2-2" />
        </svg>
      );
    case "width":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="3" y="10" width="18" height="7" rx="1" />
          <line x1="7" y1="10" x2="7" y2="13" />
          <line x1="11" y1="10" x2="11" y2="14" />
          <line x1="15" y1="10" x2="15" y2="13" />
          <path d="M4 6h16M6 4L4 6l2 2M18 4l2 2-2 2" />
        </svg>
      );
    case "depth":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "carry":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="4" y="8" width="16" height="12" rx="2.5" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          <line x1="4" y1="13" x2="20" y2="13" />
        </svg>
      );
    case "card":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="7" y1="15" x2="11" y2="15" />
        </svg>
      );
    case "cash":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "zip":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          <circle cx="12" cy="16" r="1.2" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={className}
        >
          <path d="M12 2l3 6 6 .9-4.3 4.2 1 6-5.7-3-5.7 3 1-6L3 8.9 9 8l3-6z" />
        </svg>
      );
  }
}
