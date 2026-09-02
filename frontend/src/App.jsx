import { useState, useEffect, useRef } from "react"
import axios from "axios"

const API = "http://172.27.46.159:5000"

function PodCard({ pod }) {
  const [troubleshoot, setTroubleshoot] = useState(null)
  const [loading, setLoading] = useState(false)
  const handleTroubleshoot = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/troubleshoot`, { pod_name: pod.name, namespace: pod.namespace })
      setTroubleshoot(res.data.analysis)
    } catch (e) { setTroubleshoot("Error fetching analysis") }
    setLoading(false)
  }
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.podName}>{pod.name}</span>
        <span style={{...styles.badge, background: pod.status === "Running" ? "#22c55e" : "#ef4444"}}>{pod.status}</span>
      </div>
      <div style={styles.cardBody}>
        <span style={styles.meta}>NS: {pod.namespace}</span>
        <span style={styles.meta}>Restarts: {pod.restarts}</span>
      </div>
      {pod.restarts > 3 && (
        <button style={styles.btn} onClick={handleTroubleshoot} disabled={loading}>
          {loading ? "Analyzing..." : "🤖 AI Troubleshoot"}
        </button>
      )}
      {troubleshoot && <div style={styles.analysis}><strong>AI Analysis:</strong><p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{troubleshoot}</p></div>}
    </div>
  )
}

function ManifestGenerator() {
  const [form, setForm] = useState({ workload_type: "Deployment", app_name: "", image: "", replicas: 1, cpu_limit: "100m", memory_limit: "128Mi", port: 80 })
  const [manifest, setManifest] = useState(null)
  const [valid, setValid] = useState(null)
  const [cost, setCost] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/generate-manifest`, form)
      setManifest(res.data.manifest)
      setValid(res.data.valid)
      const costRes = await axios.post(`${API}/api/estimate-cost`, form)
      setCost(costRes.data)
    } catch (e) { setManifest("Error") }
    setLoading(false)
  }

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>🤖 AI Manifest Generator</h2>
      <div style={styles.form}>
        <select style={styles.input} value={form.workload_type} onChange={e => setForm({...form, workload_type: e.target.value})}>
          <option>Deployment</option><option>StatefulSet</option><option>Job</option><option>CronJob</option>
        </select>
        <input style={styles.input} placeholder="App name" value={form.app_name} onChange={e => setForm({...form, app_name: e.target.value})} />
        <input style={styles.input} placeholder="Container image" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
        <input style={styles.input} placeholder="Replicas" type="number" value={form.replicas} onChange={e => setForm({...form, replicas: parseInt(e.target.value)})} />
        <input style={styles.input} placeholder="CPU limit (e.g. 100m)" value={form.cpu_limit} onChange={e => setForm({...form, cpu_limit: e.target.value})} />
        <input style={styles.input} placeholder="Memory limit (e.g. 128Mi)" value={form.memory_limit} onChange={e => setForm({...form, memory_limit: e.target.value})} />
        <input style={styles.input} placeholder="Port" type="number" value={form.port} onChange={e => setForm({...form, port: parseInt(e.target.value)})} />
        <button style={styles.btn} onClick={handleGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Manifest + Cost"}</button>
      </div>

      {manifest && (
        <div style={styles.manifestBox}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Generated Manifest</strong>
            <span style={{ color: valid ? "#22c55e" : "#ef4444" }}>{valid ? "✅ Valid" : "❌ Invalid"}</span>
          </div>
          <pre style={styles.code}>{manifest}</pre>
        </div>
      )}

      {cost && (
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 16, border: "1px solid #334155", marginTop: 12 }}>
          <strong style={{ color: "#38bdf8", fontSize: 14 }}>💰 Estimated Monthly Cost — AKS India Region</strong>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{...styles.metricChip, border: "1px solid #22c55e", color: "#22c55e"}}>
              Total: ₹{cost.cost_breakdown?.total_monthly_inr}/mo
            </div>
            <div style={styles.metricChip}>CPU: ₹{cost.cost_breakdown?.cpu_cost_inr}</div>
            <div style={styles.metricChip}>Memory: ₹{cost.cost_breakdown?.memory_cost_inr}</div>
            <div style={styles.metricChip}>${cost.cost_breakdown?.total_monthly_usd}/mo USD</div>
            <div style={styles.metricChip}>Cores: {cost.cost_breakdown?.cpu_cores}</div>
            <div style={styles.metricChip}>RAM: {cost.cost_breakdown?.memory_gb}GB</div>
          </div>
          <div style={{ marginTop: 12, padding: 12, background: "#1e293b", borderRadius: 8 }}>
            <strong style={{ fontSize: 12, color: "#64748b" }}>🤖 AI Cost Advice:</strong>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, lineHeight: 1.6 }}>{cost.ai_advice}</p>
          </div>
          <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>{cost.pricing_note}</p>
        </div>
      )}
    </div>
  )
}

function PredictiveAnalysis() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/predict-failures`)
      setPredictions(res.data); setLastChecked(new Date().toLocaleTimeString())
    } catch (e) { setPredictions({ status: "error", predictions: "Could not fetch" }) }
    setLoading(false)
  }
  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.sectionTitle}>🔮 Predictive Failure Detection</h2>
        <button style={styles.btn} onClick={fetchPredictions} disabled={loading}>{loading ? "Analyzing..." : "🔍 Analyze Cluster"}</button>
      </div>
      {lastChecked && <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Last checked: {lastChecked}</p>}
      {!predictions && !loading && <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}><p style={{ fontSize: 32 }}>🔮</p><p>Click Analyze Cluster to get AI predictions</p></div>}
      {predictions && predictions.metrics_collected && (
        <div style={styles.metricsRow}>
          <div style={styles.metricChip}>📊 CPU: {predictions.metrics_collected.cpu_pods}</div>
          <div style={styles.metricChip}>💾 Memory: {predictions.metrics_collected.memory_pods}</div>
          <div style={styles.metricChip}>🔄 Restarts: {predictions.metrics_collected.restart_counts}</div>
        </div>
      )}
      {predictions && predictions.predictions && (
        <div style={styles.predictionBox}>
          <strong style={{ color: "#38bdf8", display: "block", marginBottom: 12 }}>🤖 AI Analysis:</strong>
          <p style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>{predictions.predictions}</p>
        </div>
      )}
    </div>
  )
}

function AutoRemediation() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const runRemediation = async () => {
    setLoading(true)
    try { const res = await axios.post(`${API}/api/remediate`); setResult(res.data) }
    catch (e) { setResult({ error: "Failed" }) }
    setLoading(false)
  }
  const getRiskColor = (r) => r === 'LOW' ? '#22c55e' : r === 'MEDIUM' ? '#f59e0b' : '#ef4444'
  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.sectionTitle}>🛠️ Auto-Remediation</h2>
        <button style={{...styles.btn, background: "#ef4444"}} onClick={runRemediation} disabled={loading}>{loading ? "Running..." : "⚡ Run Auto-Fix"}</button>
      </div>
      {!result && !loading && <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}><p style={{ fontSize: 32 }}>🛠️</p><p>Click Run Auto-Fix to scan and fix issues automatically</p></div>}
      {result && (
        <div>
          <div style={styles.metricsRow}>
            <div style={styles.metricChip}>🔍 Scanned: {result.pods_scanned}</div>
            <div style={styles.metricChip}>🛠️ Actions: {result.remediations?.filter(r => r.ai_decision !== 'SKIP').length || 0}</div>
            <div style={styles.metricChip}>✅ Success: {result.remediations?.filter(r => r.execution?.success).length || 0}</div>
          </div>
          {result.remediations?.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#22c55e" }}><p>✅ All pods healthy!</p></div>}
          {result.remediations?.map((r, i) => (
            <div key={i} style={{...styles.card, marginBottom: 12}}>
              <div style={styles.cardHeader}>
                <span style={styles.podName}>{r.pod}</span>
                <span style={{...styles.badge, background: getRiskColor(r.risk_level)}}>{r.risk_level}</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}><strong style={{ color: "#38bdf8" }}>Decision:</strong> {r.ai_decision}</div>
              <div style={{ fontSize: 13, marginBottom: 8 }}><strong style={{ color: "#38bdf8" }}>Reason:</strong> {r.ai_reason}</div>
              {r.execution && (
                <div style={{ fontSize: 12, background: "#0f172a", padding: 10, borderRadius: 6 }}>
                  <div style={{ color: r.execution.success ? "#22c55e" : "#ef4444" }}>{r.execution.success ? "✅ Executed" : "❌ Failed"}</div>
                  {r.execution.command && <div style={{ color: "#94a3b8", fontFamily: "monospace", marginTop: 4 }}>{r.execution.command}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NLPChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm your K8s AI assistant. Tell me what you want to do in plain English!\n\nTry:\n• 'Show me all pods in monitoring namespace'\n• 'Deploy a redis cache with 2 replicas'\n• 'Scale nginx-app to 3 replicas'\n• 'What's the status of flask-backend?'" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/nlp`, { command: userMsg })
      const result = res.data.result
      const parsed = res.data.parsed
      let response = ""
      if (result.action === 'STATUS') {
        response = `Found **${result.pods?.length || 0} pods**:\n\n`
        result.pods?.slice(0, 10).forEach(p => { response += `• ${p.name} (${p.namespace}) — ${p.status} | Restarts: ${p.restarts}\n` })
        if ((result.pods?.length || 0) > 10) response += `\n...and ${result.pods.length - 10} more`
      } else if (result.action === 'DEPLOY') {
        response = result.valid
          ? `✅ **Manifest generated for ${parsed.app_name}!**\n\nWorkload: ${parsed.workload_type}\nImage: ${parsed.image}\nReplicas: ${parsed.replicas}\nMemory: ${parsed.memory_limit}\n\nManifest is valid and ready to deploy!`
          : `❌ Could not generate valid manifest: ${result.validation_message}`
      } else if (result.action === 'SCALE') {
        response = result.success ? `✅ **Scaled ${parsed.app_name} to ${parsed.replicas} replicas!**\n\n\`${result.command}\`` : `❌ Scale failed: ${result.message}`
      } else if (result.action === 'DELETE') {
        response = result.success ? `✅ **Deleted ${parsed.app_name}!**\n\n\`${result.command}\`` : `❌ Delete failed: ${result.message}`
      } else if (result.action === 'TROUBLESHOOT') {
        response = `🔍 **AI Analysis for ${result.pod}:**\n\n${result.message}`
      } else {
        response = result.message || "Command processed!"
      }
      setMessages(prev => [...prev, { role: "assistant", content: response }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error processing command. Is Flask running?" }])
    }
    setLoading(false)
  }

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>🗣️ Natural Language Cluster Control</h2>
      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #334155", height: 420, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                background: msg.role === "user" ? "#38bdf8" : "#1e293b",
                color: msg.role === "user" ? "#0f172a" : "#cbd5e1", whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#1e293b", color: "#64748b", fontSize: 13 }}>🤖 Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: 12, borderTop: "1px solid #334155", display: "flex", gap: 8 }}>
          <input style={{...styles.input, flex: 1, marginBottom: 0}} placeholder="Type a command in plain English..."
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && sendMessage()} />
          <button style={{...styles.btn, marginTop: 0, padding: "8px 16px"}} onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Show all pods", "Show pods in monitoring", "Deploy redis with 2 replicas", "Scale nginx-app to 3 replicas"].map(s => (
          <button key={s} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#64748b", cursor: "pointer" }}
            onClick={() => setInput(s)}>{s}</button>
        ))}
      </div>
    </div>
  )
}

function HealthScore({ pods }) {
  const highRestarts = pods.filter(p => p.restarts > 10).length
  const crashed = pods.filter(p => p.status !== "Running").length
  let score = 100
  score -= highRestarts * 5
  score -= crashed * 10
  score = Math.max(0, Math.min(100, score))
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  const label = score >= 80 ? "Healthy" : score >= 60 ? "Warning" : "Critical"
  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: "20px 32px", textAlign: "center", border: `2px solid ${color}` }}>
      <div style={{ fontSize: 36, fontWeight: 700, color }}>{score}</div>
      <div style={{ color, fontSize: 14, fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Health Score</div>
    </div>
  )
}

export default function App() {
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("chat")

  useEffect(() => {
    const fetchPods = () => {
      axios.get(`${API}/api/cluster/pods`)
        .then(res => { setPods(res.data.pods); setLoading(false) })
        .catch(() => setLoading(false))
    }
    fetchPods()
    const interval = setInterval(fetchPods, 30000)
    return () => clearInterval(interval)
  }, [])

  const running = pods.filter(p => p.status === "Running").length
  const issues = pods.filter(p => p.restarts > 3).length

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚡ K8sAI Command Center</h1>
        <p style={styles.subtitle}>AI-Powered Kubernetes Cluster Management</p>
      </div>
      <div style={styles.stats}>
        <div style={styles.statCard}><div style={styles.statVal}>{pods.length}</div><div style={styles.statLabel}>Total Pods</div></div>
        <div style={styles.statCard}><div style={{...styles.statVal, color: "#22c55e"}}>{running}</div><div style={styles.statLabel}>Running</div></div>
        <div style={styles.statCard}><div style={{...styles.statVal, color: "#f59e0b"}}>{issues}</div><div style={styles.statLabel}>High Restarts</div></div>
        <HealthScore pods={pods} />
      </div>
      <div style={styles.tabs}>
        {[["chat","🗣️ Chat"], ["pods","Cluster Pods"], ["generate","💰 AI Generator"], ["predict","🔮 Predictions"], ["remediate","🛠️ Auto-Fix"]].map(([id, label]) => (
          <button key={id} style={{...styles.tab, ...(tab===id?styles.activeTab:{})}} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "chat" && <NLPChat />}
      {tab === "pods" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Cluster Pods</h2>
          {loading ? <p>Loading...</p> : <div style={styles.grid}>{pods.map(pod => <PodCard key={pod.name} pod={pod} />)}</div>}
        </div>
      )}
      {tab === "generate" && <ManifestGenerator />}
      {tab === "predict" && <PredictiveAnalysis />}
      {tab === "remediate" && <AutoRemediation />}
    </div>
  )
}

const styles = {
  app: { fontFamily: "system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#f1f5f9", padding: 24 },
  header: { textAlign: "center", marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 700, color: "#38bdf8", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: 8 },
  stats: { display: "flex", gap: 16, marginBottom: 32, justifyContent: "center", flexWrap: "wrap" },
  statCard: { background: "#1e293b", borderRadius: 12, padding: "20px 32px", textAlign: "center" },
  statVal: { fontSize: 36, fontWeight: 700, color: "#38bdf8" },
  statLabel: { color: "#94a3b8", marginTop: 4, fontSize: 14 },
  tabs: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  tab: { padding: "8px 20px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14 },
  activeTab: { background: "#38bdf8", color: "#0f172a", border: "1px solid #38bdf8" },
  section: { background: "#1e293b", borderRadius: 12, padding: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#f1f5f9" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  card: { background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  podName: { fontSize: 13, fontWeight: 500, color: "#e2e8f0", wordBreak: "break-all" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 20, color: "white", flexShrink: 0, marginLeft: 8 },
  cardBody: { display: "flex", gap: 16, marginBottom: 8 },
  meta: { fontSize: 12, color: "#64748b" },
  btn: { background: "#38bdf8", color: "#0f172a", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 8 },
  analysis: { marginTop: 12, padding: 12, background: "#1e293b", borderRadius: 8, fontSize: 12, color: "#cbd5e1" },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  input: { padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 13 },
  manifestBox: { background: "#0f172a", borderRadius: 8, padding: 16, border: "1px solid #334155" },
  code: { fontSize: 12, color: "#94a3b8", overflow: "auto", maxHeight: 400, margin: 0 },
  predictionBox: { background: "#0f172a", borderRadius: 8, padding: 16, border: "1px solid #334155", marginTop: 16 },
  metricsRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  metricChip: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#94a3b8" }
}
