import os
from groq import Groq

def analyze_pod_issue(pod_name, namespace, logs, metrics, events):

    client = Groq(api_key=os.getenv('GROQ_API_KEY'))

    prompt = f"""
You are a Kubernetes SRE expert. Analyze this pod issue and explain in plain English.

Pod: {pod_name}
Namespace: {namespace}

Recent Logs:
{logs}

Current Metrics:
{metrics}

Recent Events:
{events}

Provide:
1. Problem summary (1 sentence, plain English)
2. Root cause (what actually caused this)
3. Step-by-step fix (exact kubectl commands)
4. Prevention tip (how to avoid this next time)

Be specific, actionable, and use simple language a junior engineer can follow.
"""

    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.3,
        max_tokens=1000
    )

    return response.choices[0].message.content

def get_pod_logs(pod_name, namespace):
    from kubernetes import client, config
    config.load_kube_config()
    v1 = client.CoreV1Api()
    try:
        logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace=namespace,
            tail_lines=50
        )
        return logs
    except Exception as e:
        return f"Could not fetch logs: {e}"

def get_pod_events(pod_name, namespace):
    from kubernetes import client, config
    config.load_kube_config()
    v1 = client.CoreV1Api()
    try:
        events = v1.list_namespaced_event(namespace=namespace)
        pod_events = []
        for event in events.items:
            if event.involved_object.name == pod_name:
                pod_events.append(f"{event.reason}: {event.message}")
        return '\n'.join(pod_events) if pod_events else "No events found"
    except Exception as e:
        return f"Could not fetch events: {e}"

