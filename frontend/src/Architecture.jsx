export default function Architecture() {
  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#f1f5f9" }}>
        🏗️ System Architecture
      </h2>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
        Live architecture of K8sAI Command Center — all components and data flows
      </p>
      <svg viewBox="0 0 900 620" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
        {/* Background */}
        <rect width="900" height="620" fill="#0f172a" rx="12"/>

        {/* Title */}
        <text x="450" y="35" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="bold">K8sAI Command Center — Architecture</text>

        {/* ===== USER LAYER ===== */}
        <rect x="20" y="60" width="860" height="80" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="450" y="78" textAnchor="middle" fill="#64748b" fontSize="11">USER LAYER</text>

        {/* Browser */}
        <rect x="60" y="85" width="140" height="44" fill="#0f172a" rx="6" stroke="#38bdf8" strokeWidth="1.5"/>
        <text x="130" y="105" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">🌐 Browser</text>
        <text x="130" y="120" textAnchor="middle" fill="#64748b" fontSize="9">localhost:5173</text>

        {/* React Dashboard */}
        <rect x="240" y="85" width="420" height="44" fill="#0f172a" rx="6" stroke="#6366f1" strokeWidth="1.5"/>
        <text x="450" y="102" textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="bold">⚡ React Dashboard (Vite)</text>
        <text x="450" y="118" textAnchor="middle" fill="#64748b" fontSize="9">Chat · Pods · AI Generator · Predictions · Auto-Fix</text>

        {/* GitHub */}
        <rect x="700" y="85" width="160" height="44" fill="#0f172a" rx="6" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="780" y="105" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">📦 GitHub</text>
        <text x="780" y="120" textAnchor="middle" fill="#64748b" fontSize="9">k8s-ai-command-center</text>

        {/* Arrow: Browser to React */}
        <line x1="200" y1="107" x2="240" y2="107" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow)"/>

        {/* ===== BACKEND LAYER ===== */}
        <rect x="20" y="170" width="860" height="80" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="450" y="188" textAnchor="middle" fill="#64748b" fontSize="11">BACKEND LAYER</text>

        {/* Flask */}
        <rect x="60" y="195" width="760" height="44" fill="#0f172a" rx="6" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="440" y="212" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="bold">🐍 Flask Backend (Python) — localhost:5000</text>
        <text x="440" y="228" textAnchor="middle" fill="#64748b" fontSize="9">/health · /api/cluster/pods · /api/generate-manifest · /api/troubleshoot · /api/predict-failures · /api/remediate · /api/nlp · /api/estimate-cost · /api/audit-logs</text>

        {/* Arrow: React to Flask */}
        <line x1="450" y1="129" x2="450" y2="195" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>

        {/* ===== AI LAYER ===== */}
        <rect x="20" y="280" width="420" height="80" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="230" y="298" textAnchor="middle" fill="#64748b" fontSize="11">AI LAYER</text>

        {/* Gemini */}
        <rect x="40" y="305" width="180" height="44" fill="#0f172a" rx="6" stroke="#a855f7" strokeWidth="1.5"/>
        <text x="130" y="322" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="bold">✨ Gemini 2.5 Flash</text>
        <text x="130" y="337" textAnchor="middle" fill="#64748b" fontSize="9">via OpenRouter · Manifest Gen</text>

        {/* Groq */}
        <rect x="240" y="305" width="180" height="44" fill="#0f172a" rx="6" stroke="#f43f5e" strokeWidth="1.5"/>
        <text x="330" y="322" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="bold">⚡ Groq AI</text>
        <text x="330" y="337" textAnchor="middle" fill="#64748b" fontSize="9">compound-mini · NLP/Troubleshoot</text>

        {/* Arrows: Flask to AI */}
        <line x1="200" y1="239" x2="130" y2="305" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>
        <line x1="350" y1="239" x2="330" y2="305" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>

        {/* ===== KUBERNETES LAYER ===== */}
        <rect x="460" y="280" width="420" height="80" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="670" y="298" textAnchor="middle" fill="#64748b" fontSize="11">KUBERNETES LAYER (Minikube)</text>

        {/* Argo CD */}
        <rect x="475" y="305" width="120" height="44" fill="#0f172a" rx="6" stroke="#ef4444" strokeWidth="1.5"/>
        <text x="535" y="322" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">🔄 Argo CD</text>
        <text x="535" y="337" textAnchor="middle" fill="#64748b" fontSize="9">GitOps · localhost:8080</text>

        {/* Apps */}
        <rect x="610" y="305" width="120" height="44" fill="#0f172a" rx="6" stroke="#06b6d4" strokeWidth="1.5"/>
        <text x="670" y="322" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">📦 Apps</text>
        <text x="670" y="337" textAnchor="middle" fill="#64748b" fontSize="9">nginx · flask · react</text>

        {/* Prometheus+Grafana */}
        <rect x="745" y="305" width="120" height="44" fill="#0f172a" rx="6" stroke="#f97316" strokeWidth="1.5"/>
        <text x="805" y="322" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">📊 Monitoring</text>
        <text x="805" y="337" textAnchor="middle" fill="#64748b" fontSize="9">Prometheus · Grafana</text>

        {/* Arrow: Flask to K8s */}
        <line x1="600" y1="239" x2="670" y2="280" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow)"/>

        {/* Arrow: GitHub to Argo CD */}
        <line x1="780" y1="129" x2="535" y2="305" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>

        {/* ===== DATA LAYER ===== */}
        <rect x="20" y="390" width="420" height="80" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="230" y="408" textAnchor="middle" fill="#64748b" fontSize="11">DATA LAYER</text>

        {/* PostgreSQL */}
        <rect x="40" y="415" width="180" height="44" fill="#0f172a" rx="6" stroke="#3b82f6" strokeWidth="1.5"/>
        <text x="130" y="432" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">🐘 PostgreSQL</text>
        <text x="130" y="447" textAnchor="middle" fill="#64748b" fontSize="9">Audit Logs · in-cluster</text>

        {/* Teams */}
        <rect x="240" y="415" width="180" height="44" fill="#0f172a" rx="6" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="330" y="432" textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="bold">💬 Teams Alerts</text>
        <text x="330" y="447" textAnchor="middle" fill="#64748b" fontSize="9">Power Automate Webhook</text>

        {/* Arrows to data layer */}
        <line x1="200" y1="349" x2="130" y2="415" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>
        <line x1="350" y1="349" x2="330" y2="415" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow)"/>

        {/* ===== FEATURES BOX ===== */}
        <rect x="460" y="390" width="420" height="200" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="670" y="408" textAnchor="middle" fill="#64748b" fontSize="11">KEY FEATURES</text>

        {/* Feature list */}
        {[
          ["🗣️ NLP Chat", "Plain English cluster control"],
          ["🤖 AI Manifest Gen", "Gemini generates K8s YAML"],
          ["🔍 AI Troubleshoot", "Groq explains crashes"],
          ["🔮 Predictions", "Warns before failures"],
          ["🛠️ Auto-Remediation", "AI fixes issues automatically"],
          ["💰 Cost Estimator", "Monthly AKS cost + FinOps"],
          ["🔔 Teams Alerts", "Real-time notifications"],
          ["📊 Health Score", "Live cluster health 0-100"],
        ].map(([feat, desc], i) => (
          <g key={i}>
            <text x="480" y={430 + i * 20} fill="#38bdf8" fontSize="10" fontWeight="bold">{feat}</text>
            <text x="610" y={430 + i * 20} fill="#64748b" fontSize="10">{desc}</text>
          </g>
        ))}

        {/* ===== MULTI-TENANCY ===== */}
        <rect x="20" y="490" width="420" height="110" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="1"/>
        <text x="230" y="508" textAnchor="middle" fill="#64748b" fontSize="11">MULTI-TENANCY (RBAC)</text>

        {[["team-dev", "#22c55e", "40"], ["team-staging", "#f59e0b", "180"], ["team-prod", "#ef4444", "320"]].map(([name, color, x]) => (
          <g key={name}>
            <rect x={parseInt(x)} y="515" width="120" height="70" fill="#0f172a" rx="6" stroke={color} strokeWidth="1.5"/>
            <text x={parseInt(x)+60} y="535" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">{name}</text>
            <text x={parseInt(x)+60} y="550" textAnchor="middle" fill="#64748b" fontSize="9">Resource Quota</text>
            <text x={parseInt(x)+60} y="563" textAnchor="middle" fill="#64748b" fontSize="9">RBAC Role</text>
            <text x={parseInt(x)+60} y="576" textAnchor="middle" fill="#64748b" fontSize="9">Isolated NS</text>
          </g>
        ))}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b"/>
          </marker>
        </defs>

        {/* Legend */}
        <text x="450" y="610" textAnchor="middle" fill="#334155" fontSize="9">
          K8sAI Command Center — Shakkoor Ali S
        </text>
      </svg>
    </div>
  )
}
