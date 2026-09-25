"use client";

import { useEffect, useState } from "react";
import { readPrizeAnimationsEnabled } from "@/activity/prizeAnimationsPref";

type Piece = {
  id: number;
  left: string;
  delay: string;
  color: string;
  rotate: string;
};

const COLORS = ["#22d3ee", "#fbbf24", "#f472b6", "#a3e635", "#c084fc"];

/**
 * Short in-repo burst — no particle library.
 * Hidden on ADA Guy via `.theme-decorative`.
 */
export function QuizConfetti({ burstKey }: { burstKey: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (burstKey <= 0) return;
    if (!readPrizeAnimationsEnabled()) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setPieces(
      Array.from({ length: 18 }, (_, id) => ({
        id,
        left: `${6 + ((id * 17) % 88)}%`,
        delay: `${(id % 6) * 40}ms`,
        color: COLORS[id % COLORS.length],
        rotate: `${-40 + (id * 23) % 80}deg`,
      })),
    );
    const timer = window.setTimeout(() => setPieces([]), 900);
    return () => window.clearTimeout(timer);
  }, [burstKey]);

  if (pieces.length === 0) return null;

  return (
    <div className="theme-quiz-confetti theme-decorative" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={`${burstKey}-${piece.id}`}
          className="theme-quiz-confetti__piece"
          style={{
            left: piece.left,
            background: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
