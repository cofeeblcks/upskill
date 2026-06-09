"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const prevPathname = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startProgress = () => {
    clearInterval(intervalRef.current!)
    clearTimeout(completeTimer.current!)
    clearTimeout(hideTimer.current!)

    setVisible(true)
    setWidth(0)

    requestAnimationFrame(() => {
      setWidth(15)
    })

    intervalRef.current = setInterval(() => {
      setWidth((prev) => {
        if (prev >= 85) {
          clearInterval(intervalRef.current!)
          return 85
        }
        return prev + Math.random() * 12 + 3
      })
    }, 250)
  }

  const completeProgress = () => {
    clearInterval(intervalRef.current!)
    setWidth(100)
    completeTimer.current = setTimeout(() => {
      setVisible(false)
      hideTimer.current = setTimeout(() => setWidth(0), 300)
    }, 300)
  }

  useEffect(() => {
    if (prevPathname.current === null) {
      // First mount — don't animate
      prevPathname.current = pathname
      return
    }

    if (prevPathname.current !== pathname) {
      completeProgress()
      prevPathname.current = pathname
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Intercept link clicks to start bar immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return
      const href = target.getAttribute("href")
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("target")
      ) {
        startProgress()
      }
    }

    document.addEventListener("click", handleLinkClick)
    return () => document.removeEventListener("click", handleLinkClick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (width === 0 && !visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        height: "3px",
        width: `${width}%`,
        background: "linear-gradient(90deg, #1E6FD9 0%, #3B8FFF 60%, #60a5fa 100%)",
        boxShadow: "0 0 10px rgba(59,143,255,0.6)",
        transition: width === 100
          ? "width 0.2s ease-out, opacity 0.3s ease 0.3s"
          : "width 0.3s ease-out",
        opacity: visible ? 1 : 0,
        borderRadius: "0 2px 2px 0",
      }}
    />
  )
}
