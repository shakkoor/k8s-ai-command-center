import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Architecture from "./Architecture.jsx"
import ClusterBackground from "./ClusterBackground.jsx"

const API = "http://172.27.46.159:5000"

// ============ VIBRANT THEME SYSTEM ============
// Each feature gets its own gradient identity
const themes = {
  chat:     { grad: "linear-gradient(135deg,#3b82f6,#06b6d4)", glow: "rgba(59,130,246,0.4)", solid: "#3b82f6", light: "#60a5fa", bg: "rgba(59,130,246,0.08)" },
  pods:     { grad: "linear-gradient(135deg,#8b5cf6,#d946ef)", glow: "rgba(139,92,246,0.4)", solid: "#8b5cf6", light: "#a78bfa", bg: "rgba(139,92,246,0.08)" },
  generate: { grad: "linear-gradient(135deg,#f59e0b,#f43f5e)", glow: "rgba(245,158,11,0.4)", solid: "#f59e0b", light: "#fbbf24", bg: "rgba(245,158,11,0.08)" },
  predict:  { grad: "linear-gradient(135deg,#ec4899,#a855f7)", glow: "rgba(236,72,153,0.4)", solid: "#ec4899", light: "#f472b6", bg: "rgba(236,72,153,0.08)" },
  remediate:{ grad: "linear-gradient(135deg,#10b981,#059669)", glow: "rgba(16,185,129,0.4)", solid: "#10b981", light: "#34d399", bg: "rgba(16,185,129,0.08)" },
  arch:     { grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", glow: "rgba(6,182,212,0.4)", solid: "#06b6d4", light: "#22d3ee", bg: "rgba(6,182,212,0.08)" },
}

let DARK = true
const themeColors = {
  dark: {
    bg: "#0a0e1a", card: "rgba(20,27,45,0.7)", cardSolid: "#141b2d",
    border: "rgba(255,255,255,0.08)", text: "#f8fafc", textMuted: "#8b95a9", textDim: "#c3cad9",
    inputBg: "rgba(10,14,26,0.8)",
  },
  light: {
    bg: "#f1f5f9", card: "rgba(255,255,255,0.85)", cardSolid: "#ffffff",
    border: "rgba(15,23,42,0.1)", text: "#0f172a", textMuted: "#64748b", textDim: "#334155",
    inputBg: "rgba(255,255,255,0.9)",
  }
}
const accents = { green: "#10b981", red: "#f43f5e", amber: "#f59e0b", blue: "#3b82f6", purple: "#8b5cf6", pink: "#ec4899", cyan: "#06b6d4" }
const getC = (dark) => ({ ...themeColors[dark ? "dark" : "light"], ...accents })
let c = getC(true)

// ============ BASE COMPONENTS ============
const Spinner = ({ color = "#fff" }) => (
  <div className="spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: color }} />
)

const GlowCard = ({ children, theme, style = {}, hover = false }) => {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: c.card,
        border: `1px solid ${h ? theme?.glow || c.border : c.border}`,
        borderRadius: 20,
        backdropFilter: "blur(24px)",
        boxShadow: h ? `0 12px 48px ${theme?.glow || "rgba(0,0,0,0.3)"}` : "0 4px 24px rgba(0,0,0,0.2)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: h ? "translateY(-2px)" : "none",
        ...style
      }}>{children}</div>
  )
}

const Btn = ({ children, onClick, disabled, gradient, style = {} }) => {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px 22px", borderRadius: 14, border: "none",
        fontSize: 13.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, fontFamily: "inherit", color: "#fff",
        background: gradient || "linear-gradient(135deg,#6366f1,#8b5cf6)",
        boxShadow: h && !disabled ? "0 8px 30px rgba(99,102,241,0.5)" : "0 4px 16px rgba(99,102,241,0.3)",
        transform: h && !disabled ? "translateY(-2px) scale(1.02)" : "none",
        transition: "all 0.2s", ...style
      }}>{children}</button>
  )
}

const Pill = ({ children, color }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px",
    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
    background: `${color}20`, color, border: `1px solid ${color}40`
  }}>{children}</span>
)

const SectionTitle = ({ theme, icon, title, subtitle }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
    <div className="float" style={{
      width: 54, height: 54, borderRadius: 16, background: theme.grad,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
      boxShadow: `0 8px 32px ${theme.glow}`
    }}>{icon}</div>
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
      <p style={{ fontSize: 13, color: c.textMuted, margin: 0, marginTop: 3 }}>{subtitle}</p>
    </div>
  </div>
)

const Tile = ({ label, value, sub, icon, color }) => (
  <div style={{
    padding: "16px 18px", borderRadius: 16, position: "relative", overflow: "hidden",
    background: `linear-gradient(135deg,${color}12,transparent)`,
    border: `1px solid ${color}25`
  }}>
    <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${color}15`, filter: "blur(20px)" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, position: "relative" }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 10.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color, position: "relative", letterSpacing: "-0.02em" }}>{value}</div>
    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{sub}</div>
  </div>
)

// ============ HEADER ============
const Header = ({ health, running, total, issues, dark, setDark }) => {
  const hc = health >= 80 ? c.green : health >= 60 ? c.amber : c.red
  const r = 22, circ = 2 * Math.PI * r, offset = circ - (health / 100) * circ

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,14,26,0.8)", backdropFilter: "blur(24px)",
      borderBottom: `1px solid ${c.border}`, padding: "0 28px"
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div className="glow" style={{
            width: 46, height: 46, borderRadius: 14,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }} className="gradient-text">K8sAI Command Center</div>
            <div style={{ fontSize: 10.5, color: c.textMuted, letterSpacing: "0.12em", fontWeight: 600 }}>AI-POWERED KUBERNETES OPS</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            { label: "Total Pods", value: total, icon: "📦", color: c.blue },
            { label: "Running", value: running, icon: "🟢", color: c.green },
            { label: "Issues", value: issues, icon: "⚡", color: c.amber },
          ].map(s => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 16px", borderRadius: 14,
              background: `linear-gradient(135deg,${s.color}15,transparent)`, border: `1px solid ${s.color}25`
            }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 9.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            </div>
          ))}

          <button onClick={() => setDark(!dark)} style={{
            width: 44, height: 44, borderRadius: 13, border: `1px solid ${c.border}`, cursor: "pointer",
            background: dark ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontFamily: "inherit",
            boxShadow: dark ? "0 4px 16px rgba(245,158,11,0.4)" : "0 4px 16px rgba(99,102,241,0.4)", transition: "all 0.3s"
          }} title={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☀️" : "🌙"}</button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingLeft: 18, marginLeft: 4, borderLeft: `1px solid ${c.border}` }}>
            <div style={{ position: "relative", width: 56, height: 56 }}>
              <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="28" cy="28" r={r} strokeWidth="4" stroke="rgba(255,255,255,0.06)" fill="none" />
                <circle cx="28" cy="28" r={r} strokeWidth="4" stroke={hc} fill="none"
                  strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 6px ${hc})` }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: hc }}>{health}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Health</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: hc }}>{health >= 80 ? "Healthy" : health >= 60 ? "Warning" : "Critical"}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ============ SIDEBAR ============
const Sidebar = ({ tab, setTab }) => {
  const items = [
    { id: "chat", label: "AI Chat", icon: "💬", theme: themes.chat, badge: "NEW" },
    { id: "pods", label: "Cluster Pods", icon: "📦", theme: themes.pods },
    { id: "generate", label: "Manifest Gen", icon: "✨", theme: themes.generate },
    { id: "predict", label: "Predictions", icon: "🔮", theme: themes.predict },
    { id: "remediate", label: "Auto-Remediate", icon: "🔧", theme: themes.remediate },
    { id: "arch", label: "Architecture", icon: "🏗️", theme: themes.arch },
  ]
  return (
    <aside style={{
      width: 232, flexShrink: 0, borderRight: `1px solid ${c.border}`,
      background: "rgba(15,20,35,0.5)", backdropFilter: "blur(24px)",
      position: "sticky", top: 76, height: "calc(100vh - 76px)", overflowY: "auto", padding: "16px 12px"
    }}>
      <div style={{ fontSize: 9.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 800, padding: "8px 14px" }}>Workspace</div>
      {items.map(item => {
        const active = tab === item.id
        return (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 14, border: "none", marginBottom: 4,
            background: active ? item.theme.grad : "transparent",
            color: active ? "#fff" : c.textMuted,
            cursor: "pointer", fontSize: 13.5, fontWeight: active ? 700 : 500,
            fontFamily: "inherit", transition: "all 0.2s",
            boxShadow: active ? `0 6px 24px ${item.theme.glow}` : "none",
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = item.theme.bg; e.currentTarget.style.color = item.theme.light } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted } }}>
            <span style={{ fontSize: 17 }}>{item.icon}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
            {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 10, background: active ? "rgba(255,255,255,0.25)" : "linear-gradient(135deg,#ec4899,#f43f5e)", color: "#fff" }}>{item.badge}</span>}
          </button>
        )
      })}

      <div style={{ marginTop: 28, padding: 16, borderRadius: 16, background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))", border: `1px solid ${c.border}` }}>
        <div style={{ fontSize: 9.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 14 }}>System Status</div>
        {[
          { label: "Cluster", value: "Live", color: c.green, dot: true },
          { label: "AI Engine", value: "Groq", color: c.cyan },
          { label: "Tests", value: "26/26 ✓", color: c.green },
          { label: "Budget", value: "₹0 spent", color: c.green },
          { label: "Features", value: "17 built", color: c.purple },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 11 }}>
            <span style={{ color: c.textMuted }}>{row.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {row.dot && <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: row.color, boxShadow: `0 0 8px ${row.color}` }} />}
              <span style={{ color: row.color, fontWeight: 700 }}>{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

// ============ POD CARD ============
const PodCard = ({ pod, index }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const isRunning = pod.status === "Running"
  const t = themes.pods

  const troubleshoot = async () => {
    setLoading(true); setOpen(true)
    try {
      const res = await axios.post(`${API}/api/troubleshoot`, { pod_name: pod.name, namespace: pod.namespace })
      setAnalysis(res.data.analysis)
    } catch { setAnalysis("Error fetching analysis") }
    setLoading(false)
  }
  const rc = pod.restarts > 10 ? c.red : pod.restarts > 3 ? c.amber : c.green

  return (
    <div className="slideIn" style={{
      background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18,
      position: "relative", overflow: "hidden", animationDelay: `${index * 0.03}s`,
      transition: "all 0.3s", cursor: "default"
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.glow; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${t.glow}` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: isRunning ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#f43f5e,#fb7185)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div className={isRunning ? "pulse" : ""} style={{ width: 9, height: 9, borderRadius: "50%", background: isRunning ? c.green : c.red, boxShadow: `0 0 10px ${isRunning ? c.green : c.red}` }} />
        <Pill color={isRunning ? c.green : c.red}>{pod.status}</Pill>
      </div>

      <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text, marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={pod.name}>{pod.name}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div style={{ fontSize: 9, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Namespace</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.light, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pod.namespace}</div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 12, background: `${rc}0f`, border: `1px solid ${rc}25` }}>
          <div style={{ fontSize: 9, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Restarts</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: rc, marginTop: 1 }}>{pod.restarts}</div>
        </div>
      </div>

      {pod.restarts > 3 && (
        <Btn onClick={troubleshoot} disabled={loading} gradient={t.grad} style={{ width: "100%", padding: "9px", fontSize: 12.5 }}>
          {loading ? <><Spinner /> Analyzing…</> : <>🤖 AI Troubleshoot</>}
        </Btn>
      )}

      {open && analysis && (
        <div className="slideIn" style={{ marginTop: 12, padding: 14, borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <div style={{ fontSize: 10, color: t.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>🤖 AI Diagnosis</div>
          <div style={{ fontSize: 11.5, color: c.textDim, whiteSpace: "pre-wrap", lineHeight: 1.65, maxHeight: 220, overflowY: "auto" }}>{analysis}</div>
        </div>
      )}
    </div>
  )
}

// ============ NLP CHAT ============
const NLPChat = () => {
  const t = themes.chat
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hey! 👋 I'm your Kubernetes AI assistant. Just tell me what you want — in plain English.\n\n✨ Try these:\n•  Show me all pods in monitoring namespace\n•  Deploy a redis cache with 2 replicas\n•  Scale nginx-app to 3 replicas\n•  What's the status of flask-backend?"
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const send = async () => {
    if (!input.trim()) return
    const um = input.trim(); setInput("")
    setMessages(p => [...p, { role: "user", content: um }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/nlp`, { command: um })
      const r = res.data.result, parsed = res.data.parsed
      let resp = ""
      if (r.action === "STATUS") {
        resp = `📊 Found ${r.pods?.length || 0} pods:\n\n`
        r.pods?.slice(0, 12).forEach(p => { resp += `•  ${p.name}\n    ${p.namespace} · ${p.status} · ${p.restarts} restarts\n` })
        if ((r.pods?.length || 0) > 12) resp += `\n…and ${r.pods.length - 12} more`
      } else if (r.action === "DEPLOY") {
        resp = r.valid ? `✅ Manifest generated for ${parsed.app_name}!\n\n📦 Type: ${parsed.workload_type}\n🖼️ Image: ${parsed.image}\n🔢 Replicas: ${parsed.replicas}\n\nReady to deploy!` : `❌ Could not generate valid manifest`
      } else if (r.action === "SCALE") {
        resp = r.success ? `✅ Scaled ${parsed.app_name} to ${parsed.replicas} replicas!\n\n\`${r.command}\`` : `❌ ${r.message}`
      } else if (r.action === "TROUBLESHOOT") {
        resp = `🔍 Analysis for ${r.pod}:\n\n${r.message}`
      } else { resp = r.message || "Done!" }
      setMessages(p => [...p, { role: "assistant", content: resp }])
    } catch { setMessages(p => [...p, { role: "assistant", content: "❌ Connection error. Is the backend running?" }]) }
    setLoading(false)
  }

  const sugg = ["Show all pods in monitoring", "Deploy redis with 2 replicas", "Scale nginx-app to 3 replicas", "Status of flask-backend"]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      <SectionTitle theme={t} icon="💬" title="Natural Language Control" subtitle="Talk to your Kubernetes cluster like a human — powered by Groq AI" />
      <GlowCard theme={t} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m, i) => (
            <div key={i} className="slideIn" style={{ display: "flex", gap: 12, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && <div style={{ width: 38, height: 38, borderRadius: 12, background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, boxShadow: `0 4px 16px ${t.glow}` }}>🤖</div>}
              <div style={{
                maxWidth: "72%", padding: "14px 18px", borderRadius: 18, fontSize: 13.5, lineHeight: 1.65,
                background: m.role === "user" ? t.grad : "rgba(255,255,255,0.04)",
                color: m.role === "user" ? "#fff" : c.textDim,
                border: m.role === "user" ? "none" : `1px solid ${c.border}`,
                borderTopRightRadius: m.role === "user" ? 5 : 18, borderTopLeftRadius: m.role === "assistant" ? 5 : 18,
                whiteSpace: "pre-wrap", boxShadow: m.role === "user" ? `0 4px 20px ${t.glow}` : "none"
              }}>{m.content}</div>
              {m.role === "user" && <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 800, color: "#fff" }}>S</div>}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div style={{ padding: "16px 20px", borderRadius: 18, borderTopLeftRadius: 5, background: "rgba(255,255,255,0.04)", border: `1px solid ${c.border}`, display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 200, 400].map(d => <div key={d} style={{ width: 9, height: 9, borderRadius: "50%", background: t.light, animation: `bounce 1s ease-in-out ${d}ms infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, padding: 18 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {sugg.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 11.5, cursor: "pointer", fontWeight: 600,
                background: t.bg, border: `1px solid ${t.solid}30`, color: t.light, fontFamily: "inherit", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.target.style.background = t.grad; e.target.style.color = "#fff" }}
                onMouseLeave={e => { e.target.style.background = t.bg; e.target.style.color = t.light }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()}
              placeholder="Ask anything about your cluster…"
              style={{ flex: 1, padding: "14px 18px", borderRadius: 14, background: "rgba(10,14,26,0.8)", border: `1px solid ${c.border}`, color: c.text, fontSize: 13.5, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = t.solid}
              onBlur={e => e.target.style.borderColor = c.border} />
            <Btn onClick={send} disabled={loading || !input.trim()} gradient={t.grad}>➤</Btn>
          </div>
        </div>
      </GlowCard>
    </div>
  )
}

// ============ MANIFEST GENERATOR ============
const ManifestGenerator = () => {
  const t = themes.generate
  const [form, setForm] = useState({ workload_type: "Deployment", app_name: "", image: "", replicas: 1, cpu_limit: "100m", memory_limit: "128Mi", port: 80 })
  const [manifest, setManifest] = useState(null)
  const [valid, setValid] = useState(null)
  const [cost, setCost] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/generate-manifest`, form)
      setManifest(res.data.manifest); setValid(res.data.valid)
      const cr = await axios.post(`${API}/api/estimate-cost`, form)
      setCost(cr.data)
    } catch { setManifest("Error") }
    setLoading(false)
  }

  const fs = { width: "100%", padding: "11px 14px", borderRadius: 12, background: "rgba(10,14,26,0.8)", border: `1px solid ${c.border}`, color: c.text, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }

  return (
    <div>
      <SectionTitle theme={t} icon="✨" title="AI Manifest Generator" subtitle="Describe your workload — Gemini writes production YAML + estimates cloud cost" />
      <GlowCard theme={t} style={{ padding: 26, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {[
            { label: "Workload Type", type: "select", key: "workload_type", opts: ["Deployment","StatefulSet","Job","CronJob"] },
            { label: "App Name", key: "app_name", ph: "my-app" },
            { label: "Container Image", key: "image", ph: "nginx:latest" },
            { label: "Replicas", key: "replicas", type: "number" },
            { label: "CPU Limit", key: "cpu_limit", ph: "100m" },
            { label: "Memory Limit", key: "memory_limit", ph: "128Mi" },
            { label: "Port", key: "port", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 10, color: t.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, fontWeight: 700 }}>{f.label}</label>
              {f.type === "select"
                ? <select style={fs} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} onFocus={e => e.target.style.borderColor = t.solid} onBlur={e => e.target.style.borderColor = c.border}>{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                : <input style={fs} type={f.type || "text"} placeholder={f.ph} value={form[f.key]} onChange={e => setForm({...form, [f.key]: f.type === "number" ? parseInt(e.target.value) || 1 : e.target.value})} onFocus={e => e.target.style.borderColor = t.solid} onBlur={e => e.target.style.borderColor = c.border} />}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Btn onClick={generate} disabled={loading} gradient={t.grad} style={{ width: "100%", padding: "11px" }}>
              {loading ? <><Spinner /> Generating…</> : <>✨ Generate + Cost</>}
            </Btn>
          </div>
        </div>
      </GlowCard>

      {manifest && (
        <GlowCard theme={t} style={{ overflow: "hidden", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: `1px solid ${c.border}`, background: t.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 700, color: c.text }}>📋 Generated Manifest</div>
            <Pill color={valid ? c.green : c.red}>{valid ? "✅ Valid YAML" : "❌ Invalid"}</Pill>
          </div>
          <pre style={{ padding: 22, fontSize: 12, color: c.textDim, fontFamily: "'Fira Code',monospace", overflowX: "auto", maxHeight: 420, lineHeight: 1.7, margin: 0 }}>{manifest}</pre>
        </GlowCard>
      )}

      {cost && (
        <GlowCard theme={themes.remediate} style={{ padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="float" style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 8px 28px rgba(16,185,129,0.4)" }}>💰</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Monthly Cost Estimate</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>AKS India Region · Pay-as-you-go</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg,#10b981,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹{cost.cost_breakdown?.total_monthly_inr}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>≈ ${cost.cost_breakdown?.total_monthly_usd}/mo USD</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
            <Tile label="CPU Cost" value={`₹${cost.cost_breakdown?.cpu_cost_inr}`} sub={`${cost.cost_breakdown?.cpu_cores} cores`} icon="⚙️" color={c.blue} />
            <Tile label="Memory" value={`₹${cost.cost_breakdown?.memory_cost_inr}`} sub={`${cost.cost_breakdown?.memory_gb} GB`} icon="🧠" color={c.purple} />
            <Tile label="Storage" value={`₹${cost.cost_breakdown?.storage_cost_inr}`} sub="Volumes" icon="💾" color={c.cyan} />
            <Tile label="USD/mo" value={`$${cost.cost_breakdown?.total_monthly_usd}`} sub="Monthly" icon="💵" color={c.green} />
          </div>
          <div style={{ padding: 18, borderRadius: 14, background: "linear-gradient(135deg,rgba(236,72,153,0.08),rgba(168,85,247,0.04))", border: "1px solid rgba(236,72,153,0.2)" }}>
            <div style={{ fontSize: 11, color: c.pink, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, marginBottom: 9 }}>🤖 AI FinOps Advice</div>
            <p style={{ fontSize: 12.5, color: c.textDim, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{cost.ai_advice}</p>
          </div>
        </GlowCard>
      )}
    </div>
  )
}

// ============ PREDICTIONS ============
const Predictions = () => {
  const t = themes.predict
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [last, setLast] = useState(null)
  const fetch = async () => {
    setLoading(true)
    try { const res = await axios.get(`${API}/api/predict-failures`); setData(res.data); setLast(new Date().toLocaleTimeString()) }
    catch { setData({ predictions: "Could not fetch" }) }
    setLoading(false)
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SectionTitle theme={t} icon="🔮" title="Predictive Failure Detection" subtitle="AI analyses live metrics to warn about at-risk pods before they crash" />
        <Btn onClick={fetch} disabled={loading} gradient={t.grad}>{loading ? <><Spinner /> Analyzing…</> : <>⚡ Analyze Cluster</>}</Btn>
      </div>
      {last && <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 18 }}>🔄 Last check: {last}</div>}
      {!data && !loading && (
        <GlowCard theme={t} style={{ padding: 70, textAlign: "center" }}>
          <div className="float" style={{ fontSize: 52, marginBottom: 18 }}>🔮</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 8 }}>Ready to predict failures</div>
          <p style={{ fontSize: 13, color: c.textMuted }}>Click Analyze Cluster to query Prometheus and get AI risk predictions</p>
        </GlowCard>
      )}
      {data?.metrics_collected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
          <Tile label="CPU Metrics" value={data.metrics_collected.cpu_pods} sub="pods tracked" icon="⚙️" color={c.blue} />
          <Tile label="Memory Metrics" value={data.metrics_collected.memory_pods} sub="pods tracked" icon="🧠" color={c.purple} />
          <Tile label="Restart Data" value={data.metrics_collected.restart_counts} sub="entries" icon="🔄" color={c.pink} />
        </div>
      )}
      {data?.predictions && (
        <GlowCard theme={t} style={{ padding: 26 }}>
          <div style={{ fontSize: 11, color: t.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, marginBottom: 14 }}>🤖 AI Risk Analysis</div>
          <div style={{ fontSize: 13.5, color: c.textDim, whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{data.predictions}</div>
        </GlowCard>
      )}
    </div>
  )
}

// ============ AUTO-REMEDIATION ============
const AutoRemediation = () => {
  const t = themes.remediate
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const run = async () => {
    setLoading(true)
    try { const res = await axios.post(`${API}/api/remediate`); setResult(res.data) }
    catch { setResult({ pods_scanned: 0, remediations: [] }) }
    setLoading(false)
  }
  const rColor = r => r === "LOW" ? c.green : r === "MEDIUM" ? c.amber : c.red

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SectionTitle theme={t} icon="🔧" title="Auto-Remediation" subtitle="AI detects issues, decides the safest fix, executes it — and alerts Teams" />
        <Btn onClick={run} disabled={loading} gradient="linear-gradient(135deg,#f43f5e,#ef4444)">{loading ? <><Spinner /> Running…</> : <>⚡ Run Auto-Fix</>}</Btn>
      </div>
      {!result && !loading && (
        <GlowCard theme={t} style={{ padding: 70, textAlign: "center" }}>
          <div className="float" style={{ fontSize: 52, marginBottom: 18 }}>🔧</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 8 }}>Ready to auto-remediate</div>
          <p style={{ fontSize: 13, color: c.textMuted, maxWidth: 420, margin: "0 auto" }}>AI detects CrashLoopBackOff & high restarts, decides RESTART/SCALE/SKIP by risk, and executes automatically</p>
        </GlowCard>
      )}
      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <Tile label="Pods Scanned" value={result.pods_scanned || 0} sub="checked" icon="🔍" color={c.blue} />
            <Tile label="Actions Taken" value={result.remediations?.filter(r => r.ai_decision !== "SKIP").length || 0} sub="executed" icon="⚡" color={c.amber} />
            <Tile label="Successful" value={result.remediations?.filter(r => r.execution?.success).length || 0} sub="fixed" icon="✅" color={c.green} />
          </div>
          {result.remediations?.length === 0 && (
            <GlowCard theme={t} style={{ padding: 50, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.green }}>All pods healthy!</div>
              <p style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>No remediation needed</p>
            </GlowCard>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {result.remediations?.map((r, i) => (
              <div key={i} className="slideIn" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 22, animationDelay: `${i * 0.05}s`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: rColor(r.risk_level) }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: `${rColor(r.risk_level)}15`, border: `1px solid ${rColor(r.risk_level)}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {r.ai_decision === "RESTART" ? "🔄" : r.ai_decision === "SCALE_DOWN_UP" ? "⚖️" : "⏭️"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.pod}</div>
                      <div style={{ fontSize: 12, color: c.textMuted, marginTop: 3 }}>{r.namespace} · {r.restarts} restarts</div>
                    </div>
                  </div>
                  <Pill color={rColor(r.risk_level)}>{r.risk_level} RISK</Pill>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
                  <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div style={{ fontSize: 9.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 5 }}>AI Decision</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.blue }}>{r.ai_decision}</div>
                  </div>
                  <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${c.border}` }}>
                    <div style={{ fontSize: 9.5, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 5 }}>Reasoning</div>
                    <div style={{ fontSize: 12, color: c.textDim, lineHeight: 1.5 }}>{r.ai_reason}</div>
                  </div>
                </div>
                {r.execution && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: r.execution.success ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)", border: `1px solid ${r.execution.success ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: r.execution.command ? 7 : 0 }}>
                      <span style={{ fontSize: 15 }}>{r.execution.success ? "✅" : "❌"}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.execution.success ? c.green : c.red }}>{r.execution.success ? "Executed successfully" : "Execution failed"}</span>
                    </div>
                    {r.execution.command && <code style={{ fontSize: 11, color: c.textMuted, fontFamily: "'Fira Code',monospace", display: "block", background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 8 }}>{r.execution.command}</code>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============ MAIN APP ============
export default function App() {
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("chat")
  const [nsFilter, setNsFilter] = useState("all")
  const [dark, setDark] = useState(true)
  c = getC(dark)

  useEffect(() => {
    const f = () => axios.get(`${API}/api/cluster/pods`).then(res => { setPods(res.data.pods); setLoading(false) }).catch(() => setLoading(false))
    f(); const int = setInterval(f, 30000); return () => clearInterval(int)
  }, [])

  const running = pods.filter(p => p.status === "Running").length
  const issues = pods.filter(p => p.restarts > 3).length
  const highRestarts = pods.filter(p => p.restarts > 10).length
  const crashed = pods.filter(p => p.status !== "Running").length
  const health = Math.max(0, Math.min(100, 100 - highRestarts * 5 - crashed * 10))
  const namespaces = [...new Set(pods.map(p => p.namespace))]
  const filtered = nsFilter === "all" ? pods : pods.filter(p => p.namespace === nsFilter)

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, position: "relative" }}>
      <ClusterBackground dark={dark} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div className="float" style={{ position: "absolute", top: -180, left: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)", filter: "blur(60px)" }} />
        <div className="float" style={{ position: "absolute", top: "40%", right: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.12),transparent 70%)", filter: "blur(60px)", animationDelay: "2s" }} />
        <div className="float" style={{ position: "absolute", bottom: -180, left: "40%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)", filter: "blur(60px)", animationDelay: "4s" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header health={health} running={running} total={pods.length} issues={issues} dark={dark} setDark={setDark} />
        <div style={{ display: "flex" }}>
          <Sidebar tab={tab} setTab={setTab} />
          <main style={{ flex: 1 }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", padding: 32 }}>
              {tab === "chat" && <NLPChat />}
              {tab === "pods" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <SectionTitle theme={themes.pods} icon="📦" title="Cluster Pods" subtitle={`${filtered.length} pods live · Auto-refreshes every 30s`} />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["all", ...namespaces].map(ns => (
                        <button key={ns} onClick={() => setNsFilter(ns)} style={{
                          padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                          background: nsFilter === ns ? themes.pods.grad : "rgba(255,255,255,0.03)",
                          color: nsFilter === ns ? "#fff" : c.textMuted,
                          border: `1px solid ${nsFilter === ns ? "transparent" : c.border}`,
                          boxShadow: nsFilter === ns ? `0 4px 16px ${themes.pods.glow}` : "none"
                        }}>{ns}</button>
                      ))}
                    </div>
                  </div>
                  {loading
                    ? <GlowCard theme={themes.pods} style={{ padding: 70, textAlign: "center" }}><Spinner color={themes.pods.solid} /><div style={{ fontSize: 13, color: c.textMuted, marginTop: 14 }}>Loading pods…</div></GlowCard>
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>{filtered.map((pod, i) => <PodCard key={pod.name} pod={pod} index={i} />)}</div>}
                </div>
              )}
              {tab === "generate" && <ManifestGenerator />}
              {tab === "predict" && <Predictions />}
              {tab === "remediate" && <AutoRemediation />}
              {tab === "arch" && <Architecture />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
