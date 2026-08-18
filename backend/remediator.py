import os
import subprocess
from groq import Groq
from kubernetes import client, config
from datetime import datetime

def get_problematic_pods():
    """Find pods that need remediation"""
    config.load_kube_config()
    v1 = client.CoreV1Api()
    pods = v1.list_pod_for_all_namespaces()
    
    problematic = []
    for pod in pods.items:
        restarts = 0
        phase = pod.status.phase
        is_crashloop = False
        
        if pod.status.container_statuses:
            for cs in pod.status.container_statuses:
                restarts += cs.restart_count
                if cs.state.waiting and cs.state.waiting.reason == 'CrashLoopBackOff':
                    is_crashloop = True
        
        if is_crashloop or restarts > 10:
            problematic.append({
                'name': pod.metadata.name,
                'namespace': pod.metadata.namespace,
                'restarts': restarts,
                'phase': phase,
                'is_crashloop': is_crashloop
            })
    
    return problematic

def ai_decide_action(pod_info, logs, events):
    """Ask Groq AI what action to take"""
    groq = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    prompt = f"""
You are a Kubernetes SRE. Analyse this pod and decide the safest remediation action.

Pod: {pod_info['name']}
Namespace: {pod_info['namespace']}
Restarts: {pod_info['restarts']}
CrashLoopBackOff: {pod_info['is_crashloop']}

Recent logs:
{logs[:500]}

Events:
{events[:300]}

Choose EXACTLY ONE action from this list:
- RESTART: Delete the pod so Kubernetes recreates it (safe for stateless pods)
- SCALE_DOWN_UP: Scale deployment to 0 then back to 1 (clears stuck state)
- SKIP: Do nothing (pod is recovering or issue is not fixable automatically)

Respond in this exact format:
ACTION: <RESTART|SCALE_DOWN_UP|SKIP>
REASON: <one sentence why>
RISK: <LOW|MEDIUM|HIGH>
"""
    
    response = groq.chat.completions.create(
        model='groq/compound-mini',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.1,
        max_tokens=200
    )
    
    return response.choices[0].message.content

def execute_remediation(pod_info, action):
    """Execute the AI-decided remediation action"""
    name = pod_info['name']
    namespace = pod_info['namespace']
    
    if action == 'RESTART':
        result = subprocess.run(
            ['kubectl', 'delete', 'pod', name, '-n', namespace],
            capture_output=True, text=True
        )
        success = result.returncode == 0
        return {
            'action': 'RESTART',
            'command': f'kubectl delete pod {name} -n {namespace}',
            'success': success,
            'output': result.stdout if success else result.stderr
        }
    
    elif action == 'SCALE_DOWN_UP':
        # Find the deployment name
        apps_v1 = client.AppsV1Api()
        deploys = apps_v1.list_namespaced_deployment(namespace)
        deploy_name = None
        for d in deploys.items:
            if name.startswith(d.metadata.name):
                deploy_name = d.metadata.name
                break
        
        if not deploy_name:
            return {'action': 'SCALE_DOWN_UP', 'success': False, 'output': 'Deployment not found'}
        
        # Scale down
        subprocess.run(['kubectl', 'scale', 'deployment', deploy_name,
                       '--replicas=0', '-n', namespace], capture_output=True)
        # Scale up
        import time
        time.sleep(3)
        result = subprocess.run(['kubectl', 'scale', 'deployment', deploy_name,
                                '--replicas=1', '-n', namespace], capture_output=True, text=True)
        return {
            'action': 'SCALE_DOWN_UP',
            'command': f'kubectl scale deployment {deploy_name} --replicas=0 then --replicas=1',
            'success': result.returncode == 0,
            'output': result.stdout
        }
    
    else:
        return {'action': 'SKIP', 'success': True, 'output': 'No action taken — pod is stable or issue not auto-fixable'}

def run_auto_remediation():
    """Main function — scan, decide, fix"""
    from troubleshooter import get_pod_logs, get_pod_events
    
    problematic_pods = get_problematic_pods()
    results = []
    
    for pod in problematic_pods:
        logs = get_pod_logs(pod['name'], pod['namespace'])
        events = get_pod_events(pod['name'], pod['namespace'])
        
        ai_response = ai_decide_action(pod, logs, events)
        
        # Parse AI response
        action = 'SKIP'
        reason = 'Could not parse AI response'
        risk = 'UNKNOWN'
        
        for line in ai_response.split('\n'):
            if line.startswith('ACTION:'):
                action = line.split(':')[1].strip()
            elif line.startswith('REASON:'):
                reason = line.split(':', 1)[1].strip()
            elif line.startswith('RISK:'):
                risk = line.split(':')[1].strip()
        
        # Only execute LOW or MEDIUM risk actions
        if risk == 'HIGH' or action == 'SKIP':
            execution = {'action': action, 'success': False, 'output': f'Skipped — Risk: {risk}'}
        else:
            execution = execute_remediation(pod, action)
        
        results.append({
            'pod': pod['name'],
            'namespace': pod['namespace'],
            'restarts': pod['restarts'],
            'is_crashloop': pod['is_crashloop'],
            'ai_decision': action,
            'ai_reason': reason,
            'risk_level': risk,
            'execution': execution,
            'timestamp': datetime.now().isoformat()
        })
    
    return {
        'pods_scanned': len(problematic_pods),
        'remediations': results,
        'timestamp': datetime.now().isoformat()
    }

