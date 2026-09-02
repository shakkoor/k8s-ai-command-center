import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Boxes, Bot, Sparkles, TrendingUp, Wrench, MessageSquare,
  Cpu, HardDrive, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  Send, Zap, Shield, DollarSign, Network, PlayCircle,
  Server, Database, Cloud, GitBranch, Bell, Terminal, Layers, ArrowRight
} from "lucide-react"
import Architecture from "./Architecture.jsx"

const API = "http://172.27.46.159:5000"

const Card = ({ children, className = "", ...props }) => (
  <div className={`rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.06] ${className}`} {...props}>
    {children}
  </div>
)

const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" }
  const variants = {
    primary: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/25",
    ghost: "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10",
  }
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>
}

const Badge = ({ children, color = "sky" }) => {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors[color]}`}>{children}</span>
}

const Spinner = () => <div className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />

const StatChip = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
    <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
      <Icon className={`w-4 h-4 text-${color}-400`} />
    </div>
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-white leading-tight">{value}</div>
    </div>
  </div>
)

const Header = ({ health, running, total, issues }) => {
  const healthColor = health >= 80 ? "emerald" : health >= 60 ? "amber" : "rose"
  const arc = (health / 100) * 251.2

  return (
    <header className="relative overflow-hidden border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.03] via-purple-500/[0.03] to-transparent" />
      <div className="max-w-[1600px] mx-auto px-6 py-4 relative">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">K8sAI Command Center</h1>
              <p className="text-[11px] text-slate-500 tracking-wide">AI-POWERED KUBERNETES OPS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatChip icon={Boxes} label="Pods" value={total} color="slate" />
            <StatChip icon={CheckCircle2} label="Running" value={running} color="emerald" />
            <StatChip icon={AlertTriangle} label="Issues" value={issues} color="amber" />

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="24" strokeWidth="4" className="stroke-white/5" fill="none" />
                  <circle cx="28" cy="28" r="24" strokeWidth="4" fill="none"
                    className={`stroke-${healthColor}-400 transition-all duration-700`}
                    strokeDasharray={251.2} strokeDashoffset={251.2 - arc} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold text-${healthColor}-400`}>{health}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Health</div>
                <div className={`text-sm font-semibold text-${healthColor}-400`}>
                  {health >= 80 ? "Healthy" : health >= 60 ? "Warning" : "Critical"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

const Sidebar = ({ tab, setTab }) => {
  const items = [
    { id: "chat", label: "AI Chat", icon: MessageSquare, badge: "NEW" },
    { id: "pods", label: "Cluster Pods", icon: Boxes },
    { id: "generate", label: "Manifest Gen", icon: Sparkles },
    { id: "predict", label: "Predictions", icon: TrendingUp },
    { id: "remediate", label: "Auto-Remediate", icon: Wrench },
    { id: "arch", label: "Architecture", icon: Network },
  ]

  return (
    <aside className="w-56 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
      <nav className="p-3 space-y-1">
        <div className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-3 py-2">Workspace</div>
        {items.map(item => {
          const active = tab === item.id
          const Icon = item.icon
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                active ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-white border border-sky-500/20"
                       : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-400 rounded-r" />}
              <Icon className={`w-4 h-4 ${active ? "text-sky-400" : ""}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <Badge color="purple">{item.badge}</Badge>}
            </button>
          )
        })}
        <div className="pt-6">
          <div className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-3 py-2">System</div>
          <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Cluster</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Live</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">AI Model</span>
              <span className="text-slate-300">Groq</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tests</span>
              <span className="text-emerald-400">26/26</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const Input = (props) => (
  <input className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" {...props} />
)

const MetricTile = ({ label, value, sub, icon: Icon }) => (
  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon className="w-3 h-3 text-slate-500" />
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-semibold text-white">{value}</div>
    <div className="text-[10px] text-slate-500">{sub}</div>
  </div>
)

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-sky-400" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
)

const PodCard = ({ pod }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const isRunning = pod.status === "Running"
  const isProblematic = pod.restarts > 3

  const troubleshoot = async () => {
    setLoading(true); setOpen(true)
    try {
      const res = await axios.post(`${API}/api/troubleshoot`, { pod_name: pod.name, namespace: pod.namespace })
      setAnalysis(res.data.analysis)
    } catch { setAnalysis("Error fetching analysis") }
    setLoading(false)
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/30 transition-all">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-400" : "bg-rose-400"} ${isRunning ? "animate-pulse" : ""}`} />
              <Badge color={isRunning ? "green" : "red"}>{pod.status}</Badge>
            </div>
            <div className="text-sm font-medium text-white truncate" title={pod.name}>{pod.name}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Namespace</div>
            <div className="text-xs text-slate-300 font-medium truncate">{pod.namespace}</div>
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Restarts</div>
            <div className={`text-xs font-semibold ${pod.restarts > 10 ? "text-rose-400" : pod.restarts > 3 ? "text-amber-400" : "text-slate-300"}`}>{pod.restarts}</div>
          </div>
        </div>
        {isProblematic && (
          <Button size="sm" variant="ghost" className="w-full" onClick={troubleshoot} disabled={loading}>
            {loading ? <Spinner /> : <Bot className="w-3.5 h-3.5" />}
            {loading ? "Analyzing…" : "AI Troubleshoot"}
          </Button>
        )}
        <AnimatePresence>
          {open && analysis && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-purple-500/20 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] text-purple-400 uppercase tracking-wider font-semibold">
                <Bot className="w-3 h-3" /> AI Analysis
              </div>
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{analysis}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const ManifestGenerator = () => {
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
      const c = await axios.post(`${API}/api/estimate-cost`, form)
      setCost(c.data)
    } catch { setManifest("Error") }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeader icon={Sparkles} title="AI Manifest Generator" subtitle="Describe your workload · Gemini generates production-ready YAML with cost estimation" />
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Workload Type">
            <select className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 text-sm text-white focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              value={form.workload_type} onChange={e => setForm({...form, workload_type: e.target.value})}>
              <option>Deployment</option><option>StatefulSet</option><option>Job</option><option>CronJob</option>
            </select>
          </Field>
          <Field label="App Name"><Input placeholder="my-app" value={form.app_name} onChange={e => setForm({...form, app_name: e.target.value})} /></Field>
          <Field label="Container Image"><Input placeholder="nginx:latest" value={form.image} onChange={e => setForm({...form, image: e.target.value})} /></Field>
          <Field label="Replicas"><Input type="number" value={form.replicas} onChange={e => setForm({...form, replicas: parseInt(e.target.value) || 1})} /></Field>
          <Field label="CPU Limit"><Input placeholder="100m" value={form.cpu_limit} onChange={e => setForm({...form, cpu_limit: e.target.value})} /></Field>
          <Field label="Memory Limit"><Input placeholder="128Mi" value={form.memory_limit} onChange={e => setForm({...form, memory_limit: e.target.value})} /></Field>
          <Field label="Port"><Input type="number" value={form.port} onChange={e => setForm({...form, port: parseInt(e.target.value) || 80})} /></Field>
          <div className="flex items-end">
            <Button className="w-full" onClick={generate} disabled={loading} size="lg">
              {loading ? <><Spinner /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </Button>
          </div>
        </div>
      </Card>
      {manifest && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-white">Generated Manifest</span>
              </div>
              <Badge color={valid ? "green" : "red"}>
                {valid ? <><CheckCircle2 className="w-3 h-3" /> Valid</> : <><XCircle className="w-3 h-3" /> Invalid</>}
              </Badge>
            </div>
            <pre className="p-6 text-xs text-slate-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed">{manifest}</pre>
          </Card>
        </motion.div>
      )}
      {cost && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Monthly Cost Estimate</div>
                <div className="text-[11px] text-slate-500">AKS India Region · Pay-as-you-go</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-emerald-400">₹{cost.cost_breakdown?.total_monthly_inr}</div>
                <div className="text-[11px] text-slate-500">≈ ${cost.cost_breakdown?.total_monthly_usd}/mo</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <MetricTile label="CPU Cost" value={`₹${cost.cost_breakdown?.cpu_cost_inr}`} sub={`${cost.cost_breakdown?.cpu_cores} cores`} icon={Cpu} />
              <MetricTile label="Memory Cost" value={`₹${cost.cost_breakdown?.memory_cost_inr}`} sub={`${cost.cost_breakdown?.memory_gb} GB`} icon={HardDrive} />
              <MetricTile label="Storage" value={`₹${cost.cost_breakdown?.storage_cost_inr}`} sub="Volumes" icon={Database} />
              <MetricTile label="Total USD" value={`$${cost.cost_breakdown?.total_monthly_usd}`} sub="Monthly" icon={DollarSign} />
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Cost Optimization</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{cost.ai_advice}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const Predictions = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/predict-failures`)
      setData(res.data); setLastChecked(new Date().toLocaleTimeString())
    } catch { setData({ predictions: "Could not fetch predictions" }) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader icon={TrendingUp} title="Predictive Failure Detection" subtitle="AI analyses cluster metrics to warn about at-risk pods before they crash" />
        <Button onClick={fetch} disabled={loading}>
          {loading ? <><Spinner /> Analyzing…</> : <><Zap className="w-4 h-4" /> Analyze Cluster</>}
        </Button>
      </div>
      {lastChecked && <div className="text-xs text-slate-500 flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Last check: {lastChecked}</div>}
      {!data && !loading && (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-purple-400" />
          </div>
          <div className="text-sm font-medium text-white mb-1">Ready to predict failures</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Click Analyze Cluster to query Prometheus and get AI predictions about which pods are at risk</p>
        </Card>
      )}
      {data?.metrics_collected && (
        <div className="grid grid-cols-3 gap-3">
          <MetricTile label="CPU Metrics" value={data.metrics_collected.cpu_pods} sub="pods tracked" icon={Cpu} />
          <MetricTile label="Memory Metrics" value={data.metrics_collected.memory_pods} sub="pods tracked" icon={HardDrive} />
          <MetricTile label="Restart Counts" value={data.metrics_collected.restart_counts} sub="entries" icon={RefreshCw} />
        </div>
      )}
      {data?.predictions && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Analysis</span>
          </div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{data.predictions}</div>
        </Card>
      )}
    </div>
  )
}

const AutoRemediation = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try { const res = await axios.post(`${API}/api/remediate`); setResult(res.data) }
    catch { setResult({ error: "Failed" }) }
    setLoading(false)
  }

  const risk = (r) => r === "LOW" ? "green" : r === "MEDIUM" ? "yellow" : "red"
  const actionIcon = (a) => a === "RESTART" ? RefreshCw : a === "SCALE_DOWN_UP" ? Layers : Shield

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Wrench} title="Auto-Remediation" subtitle="AI scans problematic pods and executes the safest fix automatically" />
        <Button variant="danger" onClick={run} disabled={loading}>
          {loading ? <><Spinner /> Running…</> : <><PlayCircle className="w-4 h-4" /> Run Auto-Fix</>}
        </Button>
      </div>
      {!result && !loading && (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-rose-400" />
          </div>
          <div className="text-sm font-medium text-white mb-1">Ready to remediate</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">AI will detect problematic pods, decide the safest action, and execute automatically</p>
        </Card>
      )}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="Pods Scanned" value={result.pods_scanned || 0} sub="checked" icon={Boxes} />
            <MetricTile label="Actions Taken" value={result.remediations?.filter(r => r.ai_decision !== "SKIP").length || 0} sub="executed" icon={Wrench} />
            <MetricTile label="Successful" value={result.remediations?.filter(r => r.execution?.success).length || 0} sub="applied" icon={CheckCircle2} />
          </div>
          {result.remediations?.length === 0 && (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <div className="text-sm font-medium text-white">All pods healthy!</div>
              <p className="text-xs text-slate-500 mt-1">No remediation needed</p>
            </Card>
          )}
          <div className="space-y-3">
            {result.remediations?.map((r, i) => {
              const ActionIcon = actionIcon(r.ai_decision)
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <ActionIcon className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white truncate">{r.pod}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{r.namespace} · {r.restarts} restarts</div>
                        </div>
                      </div>
                      <Badge color={risk(r.risk_level)}>{r.risk_level}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Decision</div>
                        <div className="text-xs text-white font-medium">{r.ai_decision}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Reasoning</div>
                        <div className="text-xs text-slate-300 line-clamp-2">{r.ai_reason}</div>
                      </div>
                    </div>
                    {r.execution && (
                      <div className={`p-3 rounded-lg border ${r.execution.success ? "bg-emerald-500/[0.03] border-emerald-500/20" : "bg-rose-500/[0.03] border-rose-500/20"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.execution.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          <span className={`text-xs font-medium ${r.execution.success ? "text-emerald-400" : "text-rose-400"}`}>
                            {r.execution.success ? "Executed successfully" : "Execution failed"}
                          </span>
                        </div>
                        {r.execution.command && <code className="text-[10px] text-slate-400 font-mono block mt-1">{r.execution.command}</code>}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const NLPChat = () => {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your Kubernetes AI assistant. Ask me anything in plain English.\n\nTry:\n• Show me all pods in monitoring namespace\n• Deploy a redis cache with 2 replicas\n• Scale nginx-app to 3 replicas\n• What's the status of flask-backend?"
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput("")
    setMessages(p => [...p, { role: "user", content: userMsg }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/nlp`, { command: userMsg })
      const result = res.data.result, parsed = res.data.parsed
      let response = ""
      if (result.action === "STATUS") {
        response = `Found ${result.pods?.length || 0} pods:\n\n`
        result.pods?.slice(0, 10).forEach(p => { response += `• ${p.name} (${p.namespace}) — ${p.status} · ${p.restarts} restarts\n` })
        if ((result.pods?.length || 0) > 10) response += `\n…and ${result.pods.length - 10} more`
      } else if (result.action === "DEPLOY") {
        response = result.valid
          ? `✓ Manifest generated for ${parsed.app_name}\n\nWorkload: ${parsed.workload_type}\nImage: ${parsed.image}\nReplicas: ${parsed.replicas}\nMemory: ${parsed.memory_limit}\n\nManifest is valid and ready to deploy!`
          : `✗ Could not generate valid manifest: ${result.validation_message}`
      } else if (result.action === "SCALE") {
        response = result.success ? `✓ Scaled ${parsed.app_name} to ${parsed.replicas} replicas\n\n${result.command}` : `✗ Scale failed: ${result.message}`
      } else if (result.action === "DELETE") {
        response = result.success ? `✓ Deleted ${parsed.app_name}\n\n${result.command}` : `✗ Delete failed: ${result.message}`
      } else if (result.action === "TROUBLESHOOT") {
        response = `Analysis for ${result.pod}:\n\n${result.message}`
      } else {
        response = result.message || "Command processed."
      }
      setMessages(p => [...p, { role: "assistant", content: response }])
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "✗ Error processing command. Is the backend running?" }])
    }
    setLoading(false)
  }

  const suggestions = ["Show all pods in monitoring", "Deploy redis with 2 replicas", "Scale nginx-app to 3 replicas", "Status of flask-backend"]

  return (
    <div className="space-y-4 h-[calc(100vh-160px)] flex flex-col">
      <SectionHeader icon={MessageSquare} title="Natural Language Cluster Control" subtitle="Speak to your Kubernetes cluster like a human" />
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm"
                  : "bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-tl-sm"
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs text-white font-semibold">S</span>
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 0.15, 0.3].map(d => <div key={d} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)}
                className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-sky-500/30 text-[11px] text-slate-400 hover:text-sky-400 transition-all">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()}
              placeholder="Ask anything about your cluster…"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
            <Button size="lg" onClick={send} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function App() {
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("chat")
  const [namespaceFilter, setNamespaceFilter] = useState("all")

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
  const highRestarts = pods.filter(p => p.restarts > 10).length
  const crashed = pods.filter(p => p.status !== "Running").length
  const health = Math.max(0, Math.min(100, 100 - highRestarts * 5 - crashed * 10))

  const namespaces = [...new Set(pods.map(p => p.namespace))]
  const filteredPods = namespaceFilter === "all" ? pods : pods.filter(p => p.namespace === namespaceFilter)

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>
      <Header health={health} running={running} total={pods.length} issues={issues} />
      <div className="flex">
        <Sidebar tab={tab} setTab={setTab} />
        <main className="flex-1 relative">
          <div className="max-w-[1400px] mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {tab === "chat" && <NLPChat />}
                {tab === "pods" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <SectionHeader icon={Boxes} title="Cluster Pods" subtitle={`${filteredPods.length} pods · Live from Kubernetes API`} />
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setNamespaceFilter("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${namespaceFilter === "all" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-white/[0.03] text-slate-400 border border-white/5 hover:text-white"}`}>
                          All
                        </button>
                        {namespaces.map(ns => (
                          <button key={ns} onClick={() => setNamespaceFilter(ns)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${namespaceFilter === ns ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-white/[0.03] text-slate-400 border border-white/5 hover:text-white"}`}>
                            {ns}
                          </button>
                        ))}
                      </div>
                    </div>
                    {loading ? (
                      <Card className="p-12 text-center"><Spinner /> <div className="text-sm text-slate-400 mt-3">Loading pods…</div></Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPods.map(pod => <PodCard key={pod.name} pod={pod} />)}
                      </div>
                    )}
                  </div>
                )}
                {tab === "generate" && <ManifestGenerator />}
                {tab === "predict" && <Predictions />}
                {tab === "remediate" && <AutoRemediation />}
                {tab === "arch" && <Architecture />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
