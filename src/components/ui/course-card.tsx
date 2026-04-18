"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Clock, Users, Star, Play } from "lucide-react"

interface CourseCardProps {
  id: string
  title: string
  instructor: string
  thumbnail?: string
  duration?: string
  students?: number
  rating?: number
  category?: string
  className?: string
}

const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      id,
      title,
      instructor,
      thumbnail,
      duration = "2h 30m",
      students = 0,
      rating = 4.5,
      category,
      className,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
      <Link to={`/cursos/${id}`} className="block">
        <div
          ref={ref}
          className={cn(
            "group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Play className="h-12 w-12 text-primary/40" />
              </div>
            )}

            {/* Play overlay on hover */}
            <div
              className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Category badge */}
            {category && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white/95 text-gray-700 rounded-full shadow-sm">
                {category}
              </span>
            )}

            {/* Duration badge */}
            <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium bg-black/70 text-white rounded-md flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            <p className="text-sm text-gray-500 mb-3">{instructor}</p>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4" fill="currentColor" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <Users className="h-4 w-4" />
                <span>{students.toLocaleString()} estudiantes</span>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </Link>
    )
  }
)
CourseCard.displayName = "CourseCard"

export { CourseCard }
export type { CourseCardProps }
