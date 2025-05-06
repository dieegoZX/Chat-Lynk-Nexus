"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useMediaQuery } from "../hooks/use-media-query"

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleReducedMotionChange)
    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange)
    }
  }, [])

  useEffect(() => {
    // Always render the background, even with reduced motion
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number

      constructor() {
        this.opacity = Math.random() * 0.5 + 0.1
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1 // Smaller particles on mobile
        this.speedX = reducedMotion ? 0 : Math.random() * 0.5 - 0.25 // Slower or no movement with reduced motion
        this.speedY = reducedMotion ? 0 : Math.random() * 0.5 - 0.25
        this.color = this.getRandomColor()
      }

      getRandomColor() {
        // Ensure opacity is a valid number
        const opacityValue = typeof this.opacity === "number" ? this.opacity : 0.3

        const colors = [
          `rgba(99, 102, 241, ${opacityValue})`, // indigo
          `rgba(139, 92, 246, ${opacityValue})`, // purple
          `rgba(236, 72, 153, ${opacityValue})`, // pink
          `rgba(79, 70, 229, ${opacityValue})`, // indigo darker
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        if (!reducedMotion) {
          this.x += this.speedX
          this.y += this.speedY

          if (this.x > canvas.width) this.x = 0
          else if (this.x < 0) this.x = canvas.width
          if (this.y > canvas.height) this.y = 0
          else if (this.y < 0) this.y = canvas.height
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Create particles - fewer on mobile
    const particles: Particle[] = []
    const getParticleCount = () => {
      // Always have some particles, even on mobile
      const base = isMobile ? 40 : 70
      return Math.min(base, Math.floor((canvas.width * canvas.height) / 15000))
    }

    const particleCount = getParticleCount()

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0f172a") // slate-900
      gradient.addColorStop(1, "#1e1b4b") // indigo-950
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections - fewer connections on mobile
      const maxDistance = isMobile ? 100 : 150
      drawConnections(maxDistance)

      requestAnimationFrame(animate)
    }

    // Draw connections between particles
    const drawConnections = (maxDistance: number) => {
      if (!ctx) return

      // On mobile, check fewer particles to improve performance
      const step = isMobile ? 2 : 1

      for (let a = 0; a < particles.length; a += step) {
        for (let b = a; b < particles.length; b += step) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.beginPath()
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.15})` // slate-400 with opacity
            ctx.lineWidth = 1
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [isMobile, reducedMotion])

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      {/* Floating gradient orbs - fewer and smaller on mobile */}
      {!reducedMotion && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-5 pointer-events-none">
          <motion.div
            className="absolute w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-purple-600/20 blur-[60px] sm:blur-[80px]"
            animate={{
              x: ["-10%", "30%", "10%"],
              y: ["10%", "30%", "50%"],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute w-[150px] sm:w-[250px] h-[150px] sm:h-[250px] rounded-full bg-indigo-600/20 blur-[50px] sm:blur-[70px]"
            animate={{
              x: ["60%", "40%", "70%"],
              y: ["30%", "60%", "40%"],
            }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute w-[120px] sm:w-[200px] h-[120px] sm:h-[200px] rounded-full bg-pink-600/15 blur-[40px] sm:blur-[60px]"
            animate={{
              x: ["80%", "50%", "30%"],
              y: ["70%", "30%", "60%"],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </>
  )
}

export default AnimatedBackground
