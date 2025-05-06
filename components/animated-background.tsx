"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.opacity = Math.random() * 0.5 + 0.1
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
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Create particles
    const particles: Particle[] = []
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000))

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

      // Draw connections
      drawConnections()

      requestAnimationFrame(animate)
    }

    // Draw connections between particles
    const drawConnections = () => {
      if (!ctx) return
      const maxDistance = 150

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
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
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />

      {/* Floating gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-5 pointer-events-none">
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-[80px]"
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
          className="absolute w-[250px] h-[250px] rounded-full bg-indigo-600/20 blur-[70px]"
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
          className="absolute w-[200px] h-[200px] rounded-full bg-pink-600/15 blur-[60px]"
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
    </>
  )
}

export default AnimatedBackground
