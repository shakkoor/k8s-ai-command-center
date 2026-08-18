import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://172.27.46.159:5000"

function PodCard({ pod }) {
  const [troubleshoot, setTroubleshoot] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTroubleshoot = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/troubleshoot`, {
        pod_name: pod.name, namespace: pod.namespace
      })
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
      {troubleshoot && (
        <div style={styles.analysis}>
          <strong>AI Analysis:</strong>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{troubleshoot}</p>
        </div>
      )}
    </div>
  )
}

function ManifestGenerator() {
  const [form, setForm] = useState({
    workload_type: "Deployment", app_name: "", image: "",
    replicas: 1, cpu_limit: "100m", memory_limit: "128Mi", port: 80
  })
  const [manifest, setManifest] = useState(null)
  const [valid, setValid] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/generate-manifest`, form)
      setManifest(res.data.manifest)
      setValid(res.data.valid)
    } catch (e) { setManifest("Error generating manifest") }
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
        <button style={styles.btn} onClick={handleGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Manifest"}</button>
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
      setPredictions(res.data)
      setLastChecked(new Date().toLocaleTimeString())
    } catch (e) { setPredictions({ status: "error", predictions: "Could not fetch predictions" }) }
    setLoading(false)
  }

  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.sectionTitle}>🔮 Predictive Failure Detection</h2>
        <button style={styles.btn} onClick={fetchPredictions} disabled={loading}>{loading ? "Analyzing..." : "🔍 Analyze Cluster"}</button>
      </div>
      {lastChecked && <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Last checked: {lastChecked}</p>}
      {!predictions && !loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔮</p>
          <p>Click "Analyze Cluster" to get AI predictions about potential failures</p>
        </div>
      )}
      {predictions && predictions.metrics_collected && (
        <div style={styles.metricsRow}>
          <div style={styles.metricChip}>📊 CPU pods: {predictions.metrics_collected.cpu_pods}</div>
          <div style={styles.metricChip}>💾 Memory pods: {predictions.metrics_collected.memory_pods}</div>
          <div style={styles.metricChip}>🔄 Restart counts: {predictions.metrics_collected.restart_counts}</div>
        </div>
      )}
      {predictions && predictions.predictions && (
        <div style={styles.predictionBox}>
          <strong style={{ color: "#38bdf8", display: "block", marginBottom: 12 }}>🤖 AI Analysis & Predictions:</strong>
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
    try {
      const res = await axios.post(`${API}/api/remediate`)
      setResult(res.data)
    } catch (e) { setResult({ error: "Failed to run remediation" }) }
    setLoading(false)
  }

  const getRiskColor = (risk) => {
    if (risk === 'LOW') return '#22c55e'
    if (risk === 'MEDIUM') return '#f59e0b'
    if (risk === 'HIGH') return '#ef4444'
    return '#64748b'
  }

  const getActionIcon = (action) => {
    if (action === 'RESTART') return '🔄'
    if (action === 'SCALE_DOWN_UP') return '⚖️'
    if (action === 'SKIP') return '⏭️'
    return '❓'
  }

  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.sectionTitle}>🛠️ Auto-Remediation</h2>
        <button style={{...styles.btn, background: "#ef4444"}} onClick={runRemediation} disabled={loading}>
          {loading ? "Running..." : "⚡ Run Auto-Fix"}
        </button>
      </div>

      {!result && !loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🛠️</p>
          <p>Click "Run Auto-Fix" to scan for problems and fix them automatically</p>
          <p style={{ fontSize: 12, marginTop: 8, color: "#475569" }}>AI will analyse each problematic pod and decide the safest remediation action</p>
        </div>
      )}

      {result && (
        <div>
          <div style={styles.metricsRow}>
            <div style={styles.metricChip}>🔍 Pods scanned: {result.pods_scanned}</div>
            <div style={styles.metricChip}>🛠️ Actions taken: {result.remediations?.filter(r => r.ai_decision !== 'SKIP').length || 0}</div>
            <div style={styles.metricChip}>✅ Successful: {result.remediations?.filter(r => r.execution?.success).length || 0}</div>
          </div>

          {result.remediations && result.remediations.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "#22c55e" }}>
              <p style={{ fontSize: 24 }}>✅</p>
              <p>All pods healthy — no remediation needed!</p>
            </div>
          )}

          {result.remediations && result.remediations.map((r, i) => (
            <div key={i} style={{...styles.card, marginBottom: 12}}>
              <div style={styles.cardHeader}>
                <span style={styles.podName}>{getActionIcon(r.ai_decision)} {r.pod}</span>
                <span style={{...styles.badge, background: getRiskColor(r.risk_level)}}>{r.risk_level} RISK</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>NS: {r.namespace} | Restarts: {r.restarts}</div>
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: "#38bdf8" }}>AI Decision:</strong> {r.ai_decision}
              </div>
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: "#38bdf8" }}>Reason:</strong> {r.ai_reason}
              </div>
              {r.execution && (
                <div style={{ fontSize: 12, background: "#0f172a", padding: 10, borderRadius: 6, marginTop: 8 }}>
                  <div style={{ color: r.execution.success ? "#22c55e" : "#ef4444", marginBottom: 4 }}>
                    {r.execution.success ? "✅ Executed" : "❌ Failed"}
                  </div>
                  {r.execution.command && <div style={{ color: "#94a3b8", fontFamily: "monospace" }}>{r.execution.command}</div>}
                  {r.execution.output && <div style={{ color: "#64748b", marginTop: 4 }}>{r.execution.output}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("pods")

  useEffect(() => {
    axios.get(`${API}/api/cluster/pods`)
      .then(res => { setPods(res.data.pods); setLoading(false) })
      .catch(() => setLoading(false))
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
      </div>
      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(tab==="pods"?styles.activeTab:{})}} onClick={() => setTab("pods")}>Cluster Pods</button>
        <button style={{...styles.tab, ...(tab==="generate"?styles.activeTab:{})}} onClick={() => setTab("generate")}>AI Generator</button>
        <button style={{...styles.tab, ...(tab==="predict"?styles.activeTab:{})}} onClick={() => setTab("predict")}>🔮 Predictions</button>
        <button style={{...styles.tab, ...(tab==="remediate"?styles.activeTab:{})}} onClick={() => setTab("remediate")}>🛠️ Auto-Fix</button>
      </div>
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
  stats: { display: "flex", gap: 16, marginBottom: 32, justifyContent: "center" },
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
