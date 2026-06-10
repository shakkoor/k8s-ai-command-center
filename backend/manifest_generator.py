import os
import requests
import subprocess
import tempfile
import yaml

def generate_manifest(workload_type, app_name, image, replicas, cpu_limit, memory_limit, port):
    
    prompt = f"""
You are a Kubernetes expert. Generate a production-ready Kubernetes YAML manifest.

Requirements:
- Workload type: {workload_type}
- App name: {app_name}
- Container image: {image}
- Replicas: {replicas}
- CPU limit: {cpu_limit}
- Memory limit: {memory_limit}
- Container port: {port}

Include:
- Resource requests and limits
- Liveness and readiness probes
- Labels for Prometheus scraping
- Security context (runAsNonRoot: false for simplicity)

Output ONLY valid YAML. No explanations. No markdown. No backticks.
"""

    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {os.getenv("OPENROUTER_API_KEY")}'},
        json={
            'model': 'google/gemini-2.5-flash',
            'max_tokens': 1000,
            'messages': [{'role': 'user', 'content': prompt}]
        }
    )

    manifest = response.json()['choices'][0]['message']['content']
    manifest = manifest.strip()
    if manifest.startswith('```'):
        lines = manifest.split('\n')
        manifest = '\n'.join(lines[1:-1])

    return manifest

def validate_manifest(yaml_content):
    try:
        yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        return False, f"Invalid YAML syntax: {e}"

    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write(yaml_content)
        tmp_path = f.name

    result = subprocess.run(
        ['kubectl', 'apply', '--dry-run=client', '-f', tmp_path],
        capture_output=True, text=True
    )

    os.unlink(tmp_path)

    if result.returncode != 0:
        return False, f"Kubernetes validation failed: {result.stderr}"

    return True, "Valid manifest"

