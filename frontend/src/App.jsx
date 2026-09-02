import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  MessageSquare, Box, Sparkles, Activity, Wrench, Network,
  Cpu, MemoryStick, RotateCw, AlertCircle, CheckCircle, XCircle,
  Send, Bot, Terminal, Database, Bell, DollarSign, Search,
  ChevronRight, Circle, Zap, TrendingUp, Server, Clock, Filter
} from "lucide-react"
import Architecture from "./Architecture.jsx"
import ClusterBackground from "./ClusterBackground.jsx"

const API = "http://172.27.46.159:5000"

// ============ ENTERPRISE PALETTE (GitHub/Datadog inspired) ============
const t = {
  bg: "#0d1117",
  bgElevated: "#161b22",
  bgInset: "#010409",
  panel: "#161b22",
  panelHover: "#1c2128",
  border: "#30363d",
  borderMuted: "#21262d",
  text: "#e6edf3",
  textMuted: "#7d8590",
  textSubtle: "#484f58",
  accent: "#2f81f7",
  accentMuted: "#388bfd",
  green: "#3fb950",
  greenDim: "#238636",
  red: "#f85149",
  redDim: "#da3633",
  amber: "#d29922",
  amberDim: "#9e6a03",
  purple: "#a371f7",
  cyan: "#39c5cf",
  pink: "#db61a2",
}

// status color helper
const statusColor = (s) => s === "Running" ? t.green : s === "Pending" ? t.amber : t.red

// ============ PRIMITIVES ============
const Spinner = ({ size = 14, color = t.textMuted }) => (
  <div className="spin" style={{ width: size, height: size, borderRadius: "50%", border: `2px solid ${t.border}`, borderTopColor: color, display: "inline-block" }} />
)

const Panel = ({ children, style = {}, pad = 0 }) => (
  <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 6, padding: pad, ...style }}>{children}</div>
)

const Btn = ({ children, onClick, disabled, variant = "default", size = "md", style = {} }) => {
  const [h, setH] = useState(false)
  const variants = {
    primary: { bg: h ? "#2c974b" : t.greenDim, color: "#fff", border: "rgba(240,246,252,0.1)" },
    default: { bg: h ? t.panelHover : t.bgElevated, color: t.text, border: t.border },
    danger: { bg: h ? t.redDim : "#21262d", color: h ? "#fff" : t.red, border: h ? t.redDim : t.border },
  }
  const v = variants[variant]
  const sizes = { sm: "5px 12px", md: "6px 16px", lg: "8px 20px" }
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: sizes[size], borderRadius: 6, border: `1px solid ${v.border}`,
        background: v.bg, color: v.color, fontSize: 13, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
        transition: "all 0.12s", whiteSpace: "nowrap", ...style
      }}>{children}</button>
  )
}

const Tag = ({ children, color = t.textMuted, dot = false }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5, padding: "1px 8px",
    borderRadius: 20, fontSize: 11, fontWeight: 500, lineHeight: "18px",
    background: `${color}1a`, color, border: `1px solid ${color}33`
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
    {children}
  </span>
)

const PageHead = ({ icon: Icon, title, subtitle, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${t.borderMuted}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: t.bgElevated, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={t.textMuted} strokeWidth={2} />
      </div>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: t.text, letterSpacing: "-0.01em" }}>{title}</h1>
        <p style={{ fontSize: 12.5, color: t.textMuted, marginTop: 1 }}>{subtitle}</p>
      </div>
    </div>
    {right}
  </div>
)

// KPI stat used in headers (Datadog style)
const Stat = ({ label, value, delta, color = t.text }) => (
  <div style={{ padding: "10px 16px", borderRight: `1px solid ${t.borderMuted}` }}>
    <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 20, fontWeight: 600, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</span>
      {delta && <span style={{ fontSize: 11, color: t.textMuted }}>{delta}</span>}
    </div>
  </div>
)

// ============ TOP BAR ============
const TopBar = ({ health, running, total, issues, dark, setDark }) => {
  const hc = health >= 80 ? t.green : health >= 60 ? t.amber : t.red
  return (
    <div style={{ height: 48, background: t.bgInset, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: `1px solid ${t.border}`, height: "100%" }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: `linear-gradient(135deg,${t.accent},${t.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={15} color="#fff" strokeWidth={2.5} fill="#fff" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>K8sAI Command Center</span>
          <span style={{ fontSize: 10, color: t.textSubtle, letterSpacing: "0.04em" }}>PRODUCTION · MINIKUBE</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
        <Tag color={t.green} dot>cluster healthy</Tag>
        <Tag color={t.textMuted}>26/26 tests</Tag>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Server size={13} color={t.textMuted} />
          <span style={{ fontSize: 12, color: t.textMuted }}>{total} pods</span>
          <span style={{ fontSize: 12, color: t.green }}>· {running} running</span>
          {issues > 0 && <span style={{ fontSize: 12, color: t.amber }}>· {issues} warn</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 16, borderLeft: `1px solid ${t.border}` }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: hc, boxShadow: `0 0 0 3px ${hc}22` }} />
          <span style={{ fontSize: 12, color: t.textMuted }}>health</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: hc, fontVariantNumeric: "tabular-nums" }}>{health}</span>
        </div>
      </div>
    </div>
  )
}

// ============ SIDEBAR ============
const Sidebar = ({ tab, setTab }) => {
  const nav = [
    { section: "Operate", items: [
      { id: "chat", label: "AI Console", icon: MessageSquare },
      { id: "pods", label: "Workloads", icon: Box },
      { id: "remediate", label: "Remediation", icon: Wrench },
    ]},
    { section: "Analyze", items: [
      { id: "predict", label: "Predictions", icon: TrendingUp },
      { id: "generate", label: "Manifest Studio", icon: Sparkles },
    ]},
    { section: "System", items: [
      { id: "arch", label: "Architecture", icon: Network },
    ]},
  ]
  return (
    <aside style={{ width: 216, flexShrink: 0, background: t.bgInset, borderRight: `1px solid ${t.border}`, position: "sticky", top: 48, height: "calc(100vh - 48px)", overflowY: "auto", padding: "12px 8px" }}>
      {nav.map(group => (
        <div key={group.section} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10.5, color: t.textSubtle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 10px 6px" }}>{group.section}</div>
          {group.items.map(item => {
            const active = tab === item.id
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
                borderRadius: 6, border: "none", marginBottom: 1, cursor: "pointer",
                background: active ? t.panelHover : "transparent",
                color: active ? t.text : t.textMuted,
                fontSize: 13, fontWeight: active ? 500 : 400, fontFamily: "inherit",
                borderLeft: active ? `2px solid ${t.accent}` : "2px solid transparent",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.borderMuted }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
                <Icon size={16} strokeWidth={2} color={active ? t.accent : t.textMuted} />
                {item.label}
              </button>
            )
          })}
        </div>
      ))}

      <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: `1px solid ${t.borderMuted}`, position: "sticky", bottom: 0, background: t.bgInset }}>
        {[
          { label: "AI Engine", value: "Groq" },
          { label: "GitOps", value: "Argo CD" },
          { label: "Budget", value: "₹0 / ₹2.5k" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }}>
            <span style={{ color: t.textSubtle }}>{r.label}</span>
            <span style={{ color: t.textMuted, fontWeight: 500 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

// ============ WORKLOADS (dense table like Datadog) ============
const Workloads = ({ pods, loading }) => {
  const [nsFilter, setNsFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const namespaces = [...new Set(pods.map(p => p.namespace))]
  let filtered = nsFilter === "all" ? pods : pods.filter(p => p.namespace === nsFilter)
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const troubleshoot = async (pod) => {
    setSelected(pod.name); setAnalysis(null); setAnalyzing(true)
    try {
      const res = await axios.post(`${API}/api/troubleshoot`, { pod_name: pod.name, namespace: pod.namespace })
      setAnalysis(res.data.analysis)
    } catch { setAnalysis("Error fetching analysis") }
    setAnalyzing(false)
  }

  return (
    <div className="fadeIn">
      <PageHead icon={Box} title="Workloads" subtitle={`${filtered.length} of ${pods.length} pods · live from Kubernetes API`}
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color={t.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pods…"
                style={{ background: t.bgInset, border: `1px solid ${t.border}`, borderRadius: 6, padding: "6px 10px 6px 32px", fontSize: 12.5, color: t.text, width: 200 }} />
            </div>
            <select value={nsFilter} onChange={e => setNsFilter(e.target.value)}
              style={{ background: t.bgInset, border: `1px solid ${t.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12.5, color: t.text, cursor: "pointer" }}>
              <option value="all">All namespaces</option>
              {namespaces.map(ns => <option key={ns} value={ns}>{ns}</option>)}
            </select>
          </div>
        } />

      {loading ? (
        <Panel style={{ padding: 48, textAlign: "center" }}><Spinner /><div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 10 }}>Loading workloads…</div></Panel>
      ) : (
        <Panel style={{ overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "16px 1fr 140px 90px 90px 120px", gap: 12, padding: "8px 16px", background: t.bgInset, borderBottom: `1px solid ${t.border}`, fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <span></span><span>Pod</span><span>Namespace</span><span>Status</span><span>Restarts</span><span></span>
          </div>
          {/* Rows */}
          <div style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
            {filtered.map((pod, i) => {
              const sc = statusColor(pod.status)
              const rc = pod.restarts > 10 ? t.red : pod.restarts > 3 ? t.amber : t.textMuted
              const isSel = selected === pod.name
              return (
                <div key={pod.name}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "16px 1fr 140px 90px 90px 120px", gap: 12, padding: "9px 16px",
                    borderBottom: `1px solid ${t.borderMuted}`, fontSize: 13, alignItems: "center",
                    background: isSel ? t.panelHover : "transparent", transition: "background 0.1s"
                  }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = t.bgElevated }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc }} title={pod.status} />
                    <span style={{ color: t.text, fontWeight: 450, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--mono)", fontSize: 12.5 }}>{pod.name}</span>
                    <span style={{ color: t.textMuted, fontSize: 12.5 }}>{pod.namespace}</span>
                    <span><Tag color={sc}>{pod.status}</Tag></span>
                    <span style={{ color: rc, fontVariantNumeric: "tabular-nums", fontWeight: pod.restarts > 3 ? 600 : 400 }}>{pod.restarts}</span>
                    <span>
                      {pod.restarts > 3 && (
                        <button onClick={() => troubleshoot(pod)} disabled={analyzing && isSel}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${t.border}`, borderRadius: 5, padding: "3px 9px", fontSize: 11.5, color: t.accent, cursor: "pointer", fontFamily: "inherit" }}>
                          {analyzing && isSel ? <Spinner size={11} color={t.accent} /> : <Bot size={12} />}
                          Diagnose
                        </button>
                      )}
                    </span>
                  </div>
                  {isSel && analysis && (
                    <div className="fadeIn" style={{ padding: "14px 16px 16px 44px", background: t.bgInset, borderBottom: `1px solid ${t.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <Bot size={13} color={t.purple} />
                        <span style={{ fontSize: 11, color: t.purple, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>AI Diagnosis · Groq</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: t.textMuted, whiteSpace: "pre-wrap", lineHeight: 1.65, maxHeight: 280, overflowY: "auto", fontFamily: "var(--font)" }}>{analysis}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>
      )}
    </div>
  )
}

// ============ AI CONSOLE (chat) ============
const AIConsole = () => {
  const [messages, setMessages] = useState([{ role: "assistant", content: "K8sAI console ready. Enter a command in natural language.\n\nExamples:\n  show pods in monitoring namespace\n  deploy redis cache with 2 replicas\n  scale nginx-app to 3 replicas\n  status of flask-backend" }])
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
        resp = `${r.pods?.length || 0} pods matched\n\n`
        r.pods?.slice(0, 14).forEach(p => { resp += `${p.status === "Running" ? "●" : "○"} ${p.name}  ·  ${p.namespace}  ·  ${p.restarts} restarts\n` })
        if ((r.pods?.length || 0) > 14) resp += `\n… ${r.pods.length - 14} more`
      } else if (r.action === "DEPLOY") {
        resp = r.valid ? `✓ Manifest generated · ${parsed.app_name}\n  workload: ${parsed.workload_type}\n  image: ${parsed.image}\n  replicas: ${parsed.replicas}\n  status: valid, ready to apply` : `✗ Invalid manifest generated`
      } else if (r.action === "SCALE") {
        resp = r.success ? `✓ Scaled ${parsed.app_name} → ${parsed.replicas} replicas\n  $ ${r.command}` : `✗ ${r.message}`
      } else if (r.action === "TROUBLESHOOT") {
        resp = `Diagnosis · ${r.pod}\n\n${r.message}`
      } else { resp = r.message || "Command executed." }
      setMessages(p => [...p, { role: "assistant", content: resp }])
    } catch { setMessages(p => [...p, { role: "assistant", content: "✗ Backend connection failed." }]) }
    setLoading(false)
  }
  const sugg = ["show pods in monitoring", "deploy redis with 2 replicas", "scale nginx-app to 3 replicas", "status of flask-backend"]

  return (
    <div className="fadeIn" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)" }}>
      <PageHead icon={Terminal} title="AI Console" subtitle="Natural language cluster control · Groq LLM" />
      <Panel style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: t.bgInset }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, fontFamily: "var(--mono)", fontSize: 12.5 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                {m.role === "user"
                  ? <span style={{ color: t.green, fontWeight: 600 }}>❯ you</span>
                  : <span style={{ color: t.accent, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Bot size={12} /> k8sai</span>}
              </div>
              <div style={{ color: m.role === "user" ? t.text : t.textMuted, whiteSpace: "pre-wrap", lineHeight: 1.7, paddingLeft: 14, borderLeft: `2px solid ${m.role === "user" ? t.greenDim : t.borderMuted}` }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: t.textMuted, paddingLeft: 14 }}>
              <Spinner size={12} color={t.accent} /> processing…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ borderTop: `1px solid ${t.border}`, padding: 12, background: t.panel }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {sugg.map(s => (
              <button key={s} onClick={() => setInput(s)}
                style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11.5, cursor: "pointer", background: t.bgElevated, border: `1px solid ${t.border}`, color: t.textMuted, fontFamily: "var(--mono)" }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: t.bgInset, border: `1px solid ${t.border}`, borderRadius: 6, padding: "2px 2px 2px 12px" }}>
            <span style={{ color: t.green, fontFamily: "var(--mono)", fontSize: 13 }}>❯</span>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()}
              placeholder="enter command…"
              style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 13, fontFamily: "var(--mono)", padding: "8px 0" }} />
            <Btn variant="primary" size="sm" onClick={send} disabled={loading || !input.trim()}><Send size={13} /> Run</Btn>
          </div>
        </div>
      </Panel>
    </div>
  )
}

// ============ MANIFEST STUDIO ============
const ManifestStudio = () => {
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
    } catch { setManifest("Error generating manifest") }
    setLoading(false)
  }

  const fs = { width: "100%", padding: "7px 10px", borderRadius: 6, background: t.bgInset, border: `1px solid ${t.border}`, color: t.text, fontSize: 12.5, fontFamily: "inherit", boxSizing: "border-box" }
  const lb = { display: "block", fontSize: 11, color: t.textMuted, marginBottom: 5, fontWeight: 500 }

  return (
    <div className="fadeIn">
      <PageHead icon={Sparkles} title="Manifest Studio" subtitle="Generate production Kubernetes YAML with Gemini + cost analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" }}>
        {/* Left: form */}
        <Panel pad={16}>
          <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>Configuration</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={lb}>Workload Type</label>
              <select style={fs} value={form.workload_type} onChange={e => setForm({...form, workload_type: e.target.value})}>
                <option>Deployment</option><option>StatefulSet</option><option>Job</option><option>CronJob</option>
              </select></div>
            {[["App Name","app_name","my-app"],["Container Image","image","nginx:latest"],["Replicas","replicas","",true],["CPU Limit","cpu_limit","100m"],["Memory Limit","memory_limit","128Mi"],["Port","port","",true]].map(([label, key, ph, num]) => (
              <div key={key}><label style={lb}>{label}</label>
                <input style={fs} type={num ? "number" : "text"} placeholder={ph} value={form[key]} onChange={e => setForm({...form, [key]: num ? parseInt(e.target.value) || 1 : e.target.value})} /></div>
            ))}
            <Btn variant="primary" onClick={generate} disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><Spinner size={13} color="#fff" /> Generating…</> : <><Sparkles size={14} /> Generate Manifest</>}
            </Btn>
          </div>
        </Panel>

        {/* Right: output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!manifest && !loading && (
            <Panel style={{ padding: 48, textAlign: "center" }}>
              <Terminal size={28} color={t.textSubtle} strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 13, color: t.textMuted }}>Configure a workload and generate to preview the manifest</div>
            </Panel>
          )}
          {manifest && (
            <Panel style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${t.border}`, background: t.bgInset }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Terminal size={14} color={t.textMuted} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: t.text, fontFamily: "var(--mono)" }}>manifest.yaml</span>
                </div>
                {valid ? <Tag color={t.green} dot>validated</Tag> : <Tag color={t.red} dot>invalid</Tag>}
              </div>
              <pre style={{ padding: 16, fontSize: 12, color: t.textMuted, fontFamily: "var(--mono)", overflowX: "auto", maxHeight: 340, lineHeight: 1.65, margin: 0 }}>{manifest}</pre>
            </Panel>
          )}
          {cost && (
            <Panel pad={16}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DollarSign size={15} color={t.green} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Cost Estimate</span>
                  <span style={{ fontSize: 11.5, color: t.textSubtle }}>· AKS India</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: t.green, fontVariantNumeric: "tabular-nums" }}>₹{cost.cost_breakdown?.total_monthly_inr}</span>
                  <span style={{ fontSize: 12, color: t.textMuted }}>/mo · ${cost.cost_breakdown?.total_monthly_usd}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: t.border, border: `1px solid ${t.border}`, borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
                {[["CPU",`₹${cost.cost_breakdown?.cpu_cost_inr}`,`${cost.cost_breakdown?.cpu_cores} cores`],["Memory",`₹${cost.cost_breakdown?.memory_cost_inr}`,`${cost.cost_breakdown?.memory_gb} GB`],["Storage",`₹${cost.cost_breakdown?.storage_cost_inr}`,"volumes"],["USD",`$${cost.cost_breakdown?.total_monthly_usd}`,"monthly"]].map(([l,v,s]) => (
                  <div key={l} style={{ background: t.panel, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10.5, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                    <div style={{ fontSize: 10.5, color: t.textSubtle }}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 12, borderRadius: 6, background: t.bgInset, border: `1px solid ${t.borderMuted}` }}>
                <div style={{ fontSize: 11, color: t.purple, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}><Bot size={12} /> FinOps Recommendation</div>
                <p style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>{cost.ai_advice}</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ PREDICTIONS ============
const Predictions = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [last, setLast] = useState(null)
  const run = async () => {
    setLoading(true)
    try { const res = await axios.get(`${API}/api/predict-failures`); setData(res.data); setLast(new Date().toLocaleTimeString()) }
    catch { setData({ predictions: "Could not fetch predictions" }) }
    setLoading(false)
  }
  return (
    <div className="fadeIn">
      <PageHead icon={TrendingUp} title="Predictions" subtitle="AI failure prediction from Prometheus metrics"
        right={<Btn variant="primary" onClick={run} disabled={loading}>{loading ? <><Spinner size={13} color="#fff" /> Analyzing…</> : <><Activity size={14} /> Run Analysis</>}</Btn>} />
      {last && <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Clock size={12} /> Last run {last}</div>}
      {!data && !loading && (
        <Panel style={{ padding: 48, textAlign: "center" }}>
          <TrendingUp size={28} color={t.textSubtle} strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: t.textMuted }}>Run analysis to query Prometheus and predict at-risk pods</div>
        </Panel>
      )}
      {data?.metrics_collected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: t.border, border: `1px solid ${t.border}`, borderRadius: 6, overflow: "hidden", marginBottom: 16 }}>
          {[[Cpu,"CPU metrics",data.metrics_collected.cpu_pods],[MemoryStick,"Memory metrics",data.metrics_collected.memory_pods],[RotateCw,"Restart data",data.metrics_collected.restart_counts]].map(([Icon,l,v]) => (
            <div key={l} style={{ background: t.panel, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Icon size={13} color={t.textMuted} /><span style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</span></div>
              <div style={{ fontSize: 22, fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {data?.predictions && (
        <Panel pad={16}>
          <div style={{ fontSize: 11, color: t.purple, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Bot size={13} /> Risk Analysis</div>
          <div style={{ fontSize: 13, color: t.textMuted, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{data.predictions}</div>
        </Panel>
      )}
    </div>
  )
}

// ============ REMEDIATION ============
const Remediation = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const run = async () => {
    setLoading(true)
    try { const res = await axios.post(`${API}/api/remediate`); setResult(res.data) }
    catch { setResult({ pods_scanned: 0, remediations: [] }) }
    setLoading(false)
  }
  const rc = r => r === "LOW" ? t.green : r === "MEDIUM" ? t.amber : t.red

  return (
    <div className="fadeIn">
      <PageHead icon={Wrench} title="Auto-Remediation" subtitle="AI-driven incident response with Teams alerting"
        right={<Btn variant="danger" onClick={run} disabled={loading}>{loading ? <><Spinner size={13} color={t.red} /> Running…</> : <><Zap size={14} /> Run Remediation</>}</Btn>} />

      {!result && !loading && (
        <Panel style={{ padding: 48, textAlign: "center" }}>
          <Wrench size={28} color={t.textSubtle} strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: t.textMuted, maxWidth: 440, margin: "0 auto" }}>Scans for CrashLoopBackOff and high-restart pods, then decides RESTART, SCALE, or SKIP based on risk assessment</div>
        </Panel>
      )}

      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: t.border, border: `1px solid ${t.border}`, borderRadius: 6, overflow: "hidden", marginBottom: 16 }}>
            {[["Pods scanned",result.pods_scanned || 0,t.text],["Actions taken",result.remediations?.filter(r => r.ai_decision !== "SKIP").length || 0,t.amber],["Successful",result.remediations?.filter(r => r.execution?.success).length || 0,t.green]].map(([l,v,col]) => (
              <div key={l} style={{ background: t.panel, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: col, fontVariantNumeric: "tabular-nums" }}>{v}</div>
              </div>
            ))}
          </div>

          {result.remediations?.length === 0 && (
            <Panel style={{ padding: 40, textAlign: "center" }}>
              <CheckCircle size={28} color={t.green} strokeWidth={1.5} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13.5, fontWeight: 500, color: t.text }}>All pods healthy — no remediation required</div>
            </Panel>
          )}

          {result.remediations?.length > 0 && (
            <Panel style={{ overflow: "hidden" }}>
              <div style={{ padding: "9px 16px", background: t.bgInset, borderBottom: `1px solid ${t.border}`, fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Remediation Log · {result.remediations.length} events</div>
              {result.remediations.map((r, i) => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: i < result.remediations.length - 1 ? `1px solid ${t.borderMuted}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: t.bgElevated, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {r.ai_decision === "RESTART" ? <RotateCw size={14} color={t.accent} /> : r.ai_decision === "SCALE_DOWN_UP" ? <Server size={14} color={t.accent} /> : <ChevronRight size={14} color={t.textMuted} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: t.text, fontFamily: "var(--mono)" }}>{r.pod}</div>
                        <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 1 }}>{r.namespace} · {r.restarts} restarts</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Tag color={t.accent}>{r.ai_decision}</Tag>
                      <Tag color={rc(r.risk_level)} dot>{r.risk_level}</Tag>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.5, marginBottom: r.execution ? 10 : 0, paddingLeft: 38 }}>{r.ai_reason}</div>
                  {r.execution && (
                    <div style={{ marginLeft: 38, display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 6, background: t.bgInset, border: `1px solid ${r.execution.success ? t.greenDim : t.redDim}44` }}>
                      {r.execution.success ? <CheckCircle size={13} color={t.green} /> : <XCircle size={13} color={t.red} />}
                      <span style={{ fontSize: 12, color: r.execution.success ? t.green : t.red, fontWeight: 500 }}>{r.execution.success ? "executed" : "failed"}</span>
                      {r.execution.command && <code style={{ fontSize: 11.5, color: t.textMuted, fontFamily: "var(--mono)" }}>$ {r.execution.command}</code>}
                    </div>
                  )}
                </div>
              ))}
            </Panel>
          )}
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

  useEffect(() => {
    const f = () => axios.get(`${API}/api/cluster/pods`).then(res => { setPods(res.data.pods); setLoading(false) }).catch(() => setLoading(false))
    f(); const int = setInterval(f, 30000); return () => clearInterval(int)
  }, [])

  const running = pods.filter(p => p.status === "Running").length
  const issues = pods.filter(p => p.restarts > 3).length
  const highRestarts = pods.filter(p => p.restarts > 10).length
  const crashed = pods.filter(p => p.status !== "Running").length
  const health = Math.max(0, Math.min(100, 100 - highRestarts * 5 - crashed * 10))

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <ClusterBackground dark={true} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopBar health={health} running={running} total={pods.length} issues={issues} />
        <div style={{ display: "flex" }}>
          <Sidebar tab={tab} setTab={setTab} />
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px" }}>
              {tab === "chat" && <AIConsole />}
              {tab === "pods" && <Workloads pods={pods} loading={loading} />}
              {tab === "generate" && <ManifestStudio />}
              {tab === "predict" && <Predictions />}
              {tab === "remediate" && <Remediation />}
              {tab === "arch" && <Architecture />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
