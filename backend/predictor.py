import os
import requests
from datetime import datetime

def get_prometheus_metrics():
    """Fetch current metrics from Prometheus"""
    try:
        base_url = "http://localhost:9090"
        
        metrics = {}
        
        # CPU usage per pod
        cpu_response = requests.get(f"{base_url}/api/v1/query", 
            params={"query": "sum(rate(container_cpu_usage_seconds_total{container!=''}[5m])) by (pod)"})
        if cpu_response.status_code == 200:
            metrics['cpu'] = cpu_response.json()['data']['result']
        
        # Memory usage per pod
        mem_response = requests.get(f"{base_url}/api/v1/query",
            params={"query": "sum(container_memory_usage_bytes{container!=''}) by (pod)"})
        if mem_response.status_code == 200:
            metrics['memory'] = mem_response.json()['data']['result']

        # Memory limits per pod
        mem_limit_response = requests.get(f"{base_url}/api/v1/query",
            params={"query": "sum(container_spec_memory_limit_bytes{container!=''}) by (pod)"})
        if mem_limit_response.status_code == 200:
            metrics['memory_limits'] = mem_limit_response.json()['data']['result']

        # Pod restart counts
        restart_response = requests.get(f"{base_url}/api/v1/query",
            params={"query": "sum(kube_pod_container_status_restarts_total) by (pod)"})
        if restart_response.status_code == 200:
            metrics['restarts'] = restart_response.json()['data']['result']

        return metrics
    except Exception as e:
        return {"error": str(e)}

def predict_failures(metrics):
    """Use Groq AI to analyze metrics and predict failures"""
    
    # Format metrics for AI
    metrics_summary = []
    
    if 'memory' in metrics and 'memory_limits' in metrics:
        mem_usage = {item['metric'].get('pod', 'unknown'): float(item['value'][1]) 
                     for item in metrics['memory']}
        mem_limits = {item['metric'].get('pod', 'unknown'): float(item['value'][1]) 
                      for item in metrics['memory_limits'] if float(item['value'][1]) > 0}
        
        for pod, usage in mem_usage.items():
            limit = mem_limits.get(pod, 0)
            if limit > 0:
                percentage = (usage / limit) * 100
                metrics_summary.append(
                    f"Pod: {pod} | Memory: {usage/1024/1024:.1f}MB / {limit/1024/1024:.1f}MB ({percentage:.1f}%)"
                )

    if 'restarts' in metrics:
        for item in metrics['restarts']:
            pod = item['metric'].get('pod', 'unknown')
            restarts = float(item['value'][1])
            if restarts > 0:
                metrics_summary.append(f"Pod: {pod} | Restarts: {int(restarts)}")

    if not metrics_summary:
        metrics_summary = ["No significant metrics detected"]

    prompt = f"""
You are a Kubernetes SRE expert analyzing cluster health metrics.

Current cluster metrics:
{chr(10).join(metrics_summary)}

Analyze these metrics and identify:
1. Any pods at risk of failure in the next 30 minutes
2. Pods with concerning memory usage (>70% of limit)
3. Pods with high restart counts indicating instability

For each at-risk pod provide:
- Risk level: HIGH, MEDIUM, or LOW
- Why it might fail
- Recommended action to prevent failure

If everything looks healthy, say so clearly.
Keep response concise and actionable.
"""

    try:
        from groq import Groq
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model='groq/compound-mini',
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.3,
            max_tokens=800
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Prediction error: {str(e)}"

def get_predictions():
    """Main function - fetch metrics and predict failures"""
    metrics = get_prometheus_metrics()
    
    if "error" in metrics:
        return {
            "status": "error",
            "message": f"Could not fetch metrics: {metrics['error']}",
            "predictions": None,
            "timestamp": datetime.now().isoformat()
        }
    
    predictions = predict_failures(metrics)
    
    return {
        "status": "ok",
        "predictions": predictions,
        "metrics_collected": {
            "cpu_pods": len(metrics.get('cpu', [])),
            "memory_pods": len(metrics.get('memory', [])),
            "restart_counts": len(metrics.get('restarts', []))
        },
        "timestamp": datetime.now().isoformat()
    }
