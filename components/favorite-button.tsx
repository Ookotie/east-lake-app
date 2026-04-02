"use client";

import { useState, useEffect } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(id));
  }, [id]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowSaved = toggleFavorite(id);
        setSaved(nowSaved);
      }}
      className={`p-1.5 rounded-full transition-colors ${
        saved
          ? "text-red-500 bg-red-50"
          : "text-white/80 bg-black/30 hover:text-red-400"
      } ${className}`}
      aria-label={saved ? "Remove from saved" : "Save listing"}
    >
      <svg
        className="w-5 h-5"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
