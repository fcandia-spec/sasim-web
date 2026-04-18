"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface XScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  showNavigation?: boolean
  scrollAmount?: number
}

const XScroll = React.forwardRef<HTMLDivElement, XScrollProps>(
  ({ className, children, showNavigation = true, scrollAmount = 320, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(true)
    const [isHovered, setIsHovered] = React.useState(false)

    const checkScrollability = React.useCallback(() => {
      const el = scrollRef.current
      if (el) {
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
      }
    }, [])

    React.useEffect(() => {
      checkScrollability()
      const el = scrollRef.current
      if (el) {
        el.addEventListener("scroll", checkScrollability)
        window.addEventListener("resize", checkScrollability)
        return () => {
          el.removeEventListener("scroll", checkScrollability)
          window.removeEventListener("resize", checkScrollability)
        }
      }
    }, [checkScrollability])

    const scroll = (direction: "left" | "right") => {
      const el = scrollRef.current
      if (el) {
        const amount = direction === "left" ? -scrollAmount : scrollAmount
        el.scrollBy({ left: amount, behavior: "smooth" })
      }
    }

    return (
      <div
        ref={ref}
        className={cn("relative group", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Left gradient fade */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Right gradient fade */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Left navigation button */}
        {showNavigation && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg border border-gray-200 hover:bg-white hover:scale-110 transition-all duration-200",
              isHovered ? "opacity-100" : "opacity-0 md:opacity-0"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* Right navigation button */}
        {showNavigation && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg border border-gray-200 hover:bg-white hover:scale-110 transition-all duration-200",
              isHovered ? "opacity-100" : "opacity-0 md:opacity-0"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)
XScroll.displayName = "XScroll"

export { XScroll }
