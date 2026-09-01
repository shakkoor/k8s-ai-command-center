import os
import json
import requests
from groq import Groq
from manifest_generator import generate_manifest, validate_manifest

def process_natural_language(command):
    """Parse natural language into Kubernetes actions"""
    groq = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    prompt = f"""
You are a Kubernetes assistant. Parse this natural language command into a structured JSON action.

User command: "{command}"

Respond ONLY with valid JSON, no markdown, no backticks. Choose one of these action types:

1. DEPLOY - user wants to deploy/create an app
{{
  "action": "DEPLOY",
  "app_name": "extracted name",
  "image": "extracted image or best guess",
  "replicas": number or 1,
  "memory_limit": "extracted or 128Mi",
  "cpu_limit": "extracted or 100m",
  "port": number or 80,
  "namespace": "extracted or default",
  "workload_type": "Deployment or StatefulSet or Job"
}}

2. SCALE - user wants to scale an app
{{
  "action": "SCALE",
  "app_name": "extracted name",
  "replicas": number,
  "namespace": "extracted or default"
}}

3. DELETE - user wants to delete/remove an app
{{
  "action": "DELETE",
  "app_name": "extracted name",
  "namespace": "extracted or default"
}}

4. STATUS - user wants to check status
{{
  "action": "STATUS",
  "app_name": "extracted name or null for all",
  "namespace": "extracted or null for all"
}}

5. TROUBLESHOOT - user wants to debug/fix a pod
{{
  "action": "TROUBLESHOOT",
  "app_name": "extracted pod name",
  "namespace": "extracted or default"
}}

Respond with ONLY the JSON object.
"""

    response = groq.chat.completions.create(
        model='groq/compound-mini',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.1,
        max_tokens=300
    )
    
    text = response.choices[0].message.content.strip()
    if text.startswith('```'):
        text = '\n'.join(text.split('\n')[1:-1])
    
    try:
        parsed = json.loads(text)
    except:
        return {'action': 'ERROR', 'message': f'Could not parse command: {text}'}
    
    return parsed

def execute_nlp_action(parsed):
    """Execute the parsed action"""
    import subprocess
    from kubernetes import client, config
    
    action = parsed.get('action', 'ERROR')
    result = {'action': action, 'success': False, 'message': ''}
    
    if action == 'DEPLOY':
        manifest = generate_manifest(
            workload_type=parsed.get('workload_type', 'Deployment'),
            app_name=parsed.get('app_name', 'my-app'),
            image=parsed.get('image', 'nginx:latest'),
            replicas=parsed.get('replicas', 1),
            cpu_limit=parsed.get('cpu_limit', '100m'),
            memory_limit=parsed.get('memory_limit', '128Mi'),
            port=parsed.get('port', 80)
        )
        valid, msg = validate_manifest(manifest)
        result = {
            'action': 'DEPLOY',
            'success': valid,
            'message': f"Generated {parsed.get('workload_type')} for {parsed.get('app_name')}",
            'manifest': manifest,
            'valid': valid,
            'validation_message': msg
        }
    
    elif action == 'SCALE':
        name = parsed.get('app_name')
        ns = parsed.get('namespace', 'default')
        replicas = parsed.get('replicas', 1)
        cmd = subprocess.run(
            ['kubectl', 'scale', 'deployment', name, f'--replicas={replicas}', '-n', ns],
            capture_output=True, text=True
        )
        result = {
            'action': 'SCALE',
            'success': cmd.returncode == 0,
            'message': cmd.stdout if cmd.returncode == 0 else cmd.stderr,
            'command': f'kubectl scale deployment {name} --replicas={replicas} -n {ns}'
        }
    
    elif action == 'DELETE':
        name = parsed.get('app_name')
        ns = parsed.get('namespace', 'default')
        cmd = subprocess.run(
            ['kubectl', 'delete', 'deployment', name, '-n', ns],
            capture_output=True, text=True
        )
        result = {
            'action': 'DELETE',
            'success': cmd.returncode == 0,
            'message': cmd.stdout if cmd.returncode == 0 else cmd.stderr,
            'command': f'kubectl delete deployment {name} -n {ns}'
        }
    
    elif action == 'STATUS':
        config.load_kube_config()
        v1 = client.CoreV1Api()
        ns = parsed.get('namespace')
        name = parsed.get('app_name')
        
        if ns and ns != 'null':
            pods = v1.list_namespaced_pod(ns)
        else:
            pods = v1.list_pod_for_all_namespaces()
        
        pod_list = []
        for pod in pods.items:
            if name and name != 'null' and name not in pod.metadata.name:
                continue
            pod_list.append({
                'name': pod.metadata.name,
                'namespace': pod.metadata.namespace,
                'status': pod.status.phase,
                'restarts': pod.status.container_statuses[0].restart_count if pod.status.container_statuses else 0
            })
        
        result = {
            'action': 'STATUS',
            'success': True,
            'message': f'Found {len(pod_list)} pods',
            'pods': pod_list
        }
    
    elif action == 'TROUBLESHOOT':
        from troubleshooter import analyze_pod_issue, get_pod_logs, get_pod_events
        name = parsed.get('app_name')
        ns = parsed.get('namespace', 'default')
        logs = get_pod_logs(name, ns)
        events = get_pod_events(name, ns)
        analysis = analyze_pod_issue(name, ns, logs, "N/A", events)
        result = {
            'action': 'TROUBLESHOOT',
            'success': True,
            'message': analysis,
            'pod': name
        }
    
    else:
        result = {
            'action': 'ERROR',
            'success': False,
            'message': parsed.get('message', 'Unknown action')
        }
    
    return result

