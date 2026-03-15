import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

interface HeartFavoriteProps {
  count?: number;
  liked?: boolean;
  onToggle?: (isLiked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function HeartFavorite({ count = 0, liked = false, onToggle, size = "md" }: HeartFavoriteProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [displayCount, setDisplayCount] = useState(count);

  function handleClick() {
    const next = !isLiked;
    setIsLiked(next);
    setDisplayCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
    onToggle?.(next);
  }

  const sizes = {
    sm: { icon: 20, pad: 8, font: "0.82rem" },
    md: { icon: 26, pad: 10, font: "0.92rem" },
    lg: { icon: 32, pad: 12, font: "1rem" },
  };
  const s = sizes[size];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.8 }}
        style={{
          borderRadius: "50%",
          padding: s.pad,
          background: isLiked ? "rgba(239,68,68,0.1)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
          cursor: "pointer",
          border: "none",
        }}
      >
        <motion.div
          animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Heart
            size={s.icon}
            style={{ color: isLiked ? "#EF4444" : "var(--tf)", transition: "color 0.2s" }}
            fill={isLiked ? "#EF4444" : "none"}
          />
        </motion.div>
      </motion.button>
      <motion.span
        key={displayCount}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: s.font,
          fontWeight: 700,
          color: isLiked ? "#EF4444" : "var(--tf)",
          minWidth: 18,
          transition: "color 0.2s",
        }}
      >
        {displayCount > 0 ? displayCount : ""}
      </motion.span>
    </div>
  );
}
