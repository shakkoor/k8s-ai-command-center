import { useEffect, useRef } from "react"

export default function ClusterBackground({ dark = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationId
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Node types representing Kubernetes components
    const nodeColors = dark
      ? ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#ec4899"]
      : ["#6366f1", "#8b5cf6", "#0891b2", "#059669", "#db2777"]

    // Create cluster nodes (pods/services)
    const NODE_COUNT = 28
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 2,
      color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
      isHub: i < 5, // some are control-plane hubs
    }))

    // Data packets traveling along connections
    const packets = []

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const maxDist = 180
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * (dark ? 0.15 : 0.1)
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = dark ? `rgba(99,102,241,${opacity})` : `rgba(99,102,241,${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()

            // Occasionally spawn a data packet
            if (Math.random() < 0.0008 && packets.length < 40) {
              packets.push({ from: i, to: j, progress: 0, speed: 0.01 + Math.random() * 0.015, color: nodes[i].color })
            }
          }
        }
      }

      // Draw and update packets (data flowing between pods)
      for (let p = packets.length - 1; p >= 0; p--) {
        const pk = packets[p]
        const from = nodes[pk.from], to = nodes[pk.to]
        const x = from.x + (to.x - from.x) * pk.progress
        const y = from.y + (to.y - from.y) * pk.progress
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pk.color
        ctx.shadowBlur = 8
        ctx.shadowColor = pk.color
        ctx.fill()
        ctx.shadowBlur = 0
        pk.progress += pk.speed
        if (pk.progress >= 1) packets.splice(p, 1)
      }

      // Draw nodes
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        n.pulse += n.pulseSpeed

        const pulseFactor = 1 + Math.sin(n.pulse) * 0.3

        // Glow ring for hub nodes (control plane)
        if (n.isHub) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius * 3 * pulseFactor, 0, Math.PI * 2)
          ctx.strokeStyle = n.color + "22"
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Node core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * pulseFactor, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.shadowBlur = n.isHub ? 15 : 6
        ctx.shadowColor = n.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [dark])

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0, opacity: dark ? 0.6 : 0.4
    }} />
  )
}
