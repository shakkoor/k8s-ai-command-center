import os
import requests
from datetime import datetime

WEBHOOK_URL = os.getenv('TEAMS_WEBHOOK_URL', '')

def send_alert(title, message, severity="INFO", pod_name=None, action=None):
    """Send alert to Teams via Power Automate"""
    if not WEBHOOK_URL:
        return False
    
    emoji = "🔵" if severity == "INFO" else "🟡" if severity == "WARNING" else "🔴"
    
    # Power Automate expects this format
    payload = {
        "type": "message",
        "attachments": [{
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": {
                "type": "AdaptiveCard",
                "version": "1.2",
                "body": [
                    {
                        "type": "TextBlock",
                        "text": f"{emoji} K8sAI Alert — {title}",
                        "weight": "Bolder",
                        "size": "Medium"
                    },
                    {
                        "type": "FactSet",
                        "facts": [
                            {"title": "Severity", "value": severity},
                            {"title": "Time", "value": datetime.now().strftime('%Y-%m-%d %H:%M:%S')},
                            *([{"title": "Pod", "value": pod_name}] if pod_name else []),
                            *([{"title": "Action", "value": action}] if action else []),
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "text": message,
                        "wrap": True
                    }
                ]
            }
        }]
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=10)
        return response.status_code in [200, 201, 202, 204]
    except Exception as e:
        print(f"Alert failed: {e}")
        return False

def alert_remediation(pod_name, namespace, action, reason, success):
    send_alert(
        title="Auto-Remediation Executed",
        message=f"Namespace: {namespace}\nAction: {action}\nReason: {reason}\nStatus: {'Success' if success else 'Failed'}",
        severity="INFO" if success else "WARNING",
        pod_name=pod_name, action=action
    )

def alert_high_risk_pod(pod_name, namespace, restarts, reason):
    send_alert(
        title="HIGH RISK Pod Detected",
        message=f"Namespace: {namespace}\nRestarts: {restarts}\nReason: {reason}\nImmediate attention required!",
        severity="CRITICAL",
        pod_name=pod_name
    )

def alert_crashloop(pod_name, namespace):
    send_alert(
        title="CrashLoopBackOff Detected",
        message=f"Namespace: {namespace}\nPod is repeatedly crashing. Auto-remediation will attempt to fix.",
        severity="WARNING",
        pod_name=pod_name
    )
