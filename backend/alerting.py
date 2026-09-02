import os
import requests
from datetime import datetime

WEBHOOK_URL = os.getenv('TEAMS_WEBHOOK_URL', '')

def send_alert(title, message, severity="INFO", pod_name=None, action=None):
    """Send alert to Teams/webhook"""
    if not WEBHOOK_URL:
        return False
    
    emoji = "🔵" if severity == "INFO" else "🟡" if severity == "WARNING" else "🔴"
    
    payload = {
        "title": f"{emoji} K8sAI Alert — {title}",
        "body": f"""
**Severity:** {severity}
**Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{f'**Pod:** {pod_name}' if pod_name else ''}
{f'**Action:** {action}' if action else ''}

**Details:**
{message}

---
*K8sAI Command Center — Automated Alert*
        """.strip()
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=5)
        return response.status_code in [200, 201, 202, 204]
    except Exception as e:
        print(f"Alert failed: {e}")
        return False

def alert_remediation(pod_name, namespace, action, reason, success):
    """Alert when auto-remediation runs"""
    severity = "INFO" if success else "WARNING"
    send_alert(
        title="Auto-Remediation Executed",
        message=f"Namespace: {namespace}\nAction: {action}\nReason: {reason}\nStatus: {'✅ Success' if success else '❌ Failed'}",
        severity=severity,
        pod_name=pod_name,
        action=action
    )

def alert_high_risk_pod(pod_name, namespace, restarts, reason):
    """Alert when a pod is detected as HIGH risk"""
    send_alert(
        title="HIGH RISK Pod Detected",
        message=f"Namespace: {namespace}\nRestarts: {restarts}\nRisk: HIGH\nReason: {reason}\n\n⚠️ Immediate attention required!",
        severity="CRITICAL",
        pod_name=pod_name
    )

def alert_crashloop(pod_name, namespace):
    """Alert when CrashLoopBackOff detected"""
    send_alert(
        title="CrashLoopBackOff Detected",
        message=f"Namespace: {namespace}\nPod is repeatedly crashing. Auto-remediation will attempt to fix.",
        severity="WARNING",
        pod_name=pod_name
    )

