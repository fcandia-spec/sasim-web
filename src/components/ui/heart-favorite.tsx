import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

interface HeartFavoriteProps {
  count?: number;
  liked?: boolean;
  onToggle?: (isLiked: boolean) => void;
  size?: "sm" | "md";
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

  const iconSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const padding = size === "sm" ? "p-2" : "p-3";
  const fontSize = size === "sm" ? "0.78rem" : "0.88rem";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.85 }}
        style={{
          borderRadius: "50%",
          padding: 0,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        className={padding}
      >
        <motion.div
          animate={{ scale: isLiked ? [1, 1.35, 1] : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Heart
            className={`${iconSize} transition-colors duration-200 ${
              isLiked ? "fill-red-500 text-red-500" : ""
            }`}
            style={{ color: isLiked ? "#EF4444" : "var(--tf)" }}
            fill={isLiked ? "#EF4444" : "none"}
          />
        </motion.div>
      </motion.button>
      <motion.span
        key={displayCount}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize,
          fontWeight: 700,
          color: isLiked ? "#EF4444" : "var(--tf)",
          minWidth: 16,
          transition: "color 0.2s",
        }}
      >
        {displayCount > 0 ? displayCount : ""}
      </motion.span>
    </div>
  );
}
