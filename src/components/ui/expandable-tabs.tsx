import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import type { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  id: string;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  id?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeId?: string;
  className?: string;
  onChange?: (id: string) => void;
}

const buttonVariants = {
  initial: { gap: 0, paddingLeft: ".5rem", paddingRight: ".5rem" },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({ tabs, activeId, onChange }: ExpandableTabsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLElement>, () => {
    setHovered(null);
  });

  return (
    <div
      ref={outsideClickRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        padding: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <div
              key={"sep-" + index}
              style={{
                width: 1.2,
                height: 24,
                background: "var(--border)",
                margin: "0 4px",
              }}
            />
          );
        }

        const Icon = tab.icon;
        const isActive = tab.id === activeId;
        const isHoveredOrActive = hovered === index || isActive;

        return (
          <motion.button
            key={tab.id}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isHoveredOrActive}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange?.(tab.id)}
            transition={transition}
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: isActive ? "var(--acc-s)" : "transparent",
              color: isActive ? "var(--acc)" : "var(--tm)",
              transition: "background 0.2s, color 0.2s",
              fontFamily: "var(--fb)",
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={18} />
            <AnimatePresence initial={false}>
              {isHoveredOrActive && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  style={{ overflow: "hidden" }}
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
