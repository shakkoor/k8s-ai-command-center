from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time

load_dotenv('../.env')

app = Flask(__name__)
CORS(app)

# Initialize audit table on startup
try:
    from audit_logger import setup_audit_table
    setup_audit_table()
except:
    pass

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'K8sAI Command Center backend is running'
    })

@app.route('/api/cluster/pods', methods=['GET'])
def get_pods():
    start = time.time()
    from kubernetes import client, config
    config.load_kube_config()
    v1 = client.CoreV1Api()
    pods = v1.list_pod_for_all_namespaces()
    pod_list = []
    for pod in pods.items:
        pod_list.append({
            'name': pod.metadata.name,
            'namespace': pod.metadata.namespace,
            'status': pod.status.phase,
            'restarts': pod.status.container_statuses[0].restart_count if pod.status.container_statuses else 0
        })
    try:
        from audit_logger import log_action
        log_action('get_pods', resource_type='Pod', status='success',
                   details={'pod_count': len(pod_list)},
                   response_time_ms=int((time.time()-start)*1000))
    except: pass
    return jsonify({'pods': pod_list})

@app.route('/api/generate-manifest', methods=['POST'])
def generate_manifest_endpoint():
    start = time.time()
    from manifest_generator import generate_manifest, validate_manifest
    data = request.json
    manifest = generate_manifest(
        workload_type=data.get('workload_type', 'Deployment'),
        app_name=data.get('app_name', 'my-app'),
        image=data.get('image', 'nginx:latest'),
        replicas=data.get('replicas', 1),
        cpu_limit=data.get('cpu_limit', '100m'),
        memory_limit=data.get('memory_limit', '128Mi'),
        port=data.get('port', 80)
    )
    valid, message = validate_manifest(manifest)
    try:
        from audit_logger import log_action
        log_action('generate_manifest', resource_type=data.get('workload_type'),
                   resource_name=data.get('app_name'), status='success' if valid else 'error',
                   details={'valid': valid, 'workload_type': data.get('workload_type')},
                   ai_model='gemini-2.5-flash',
                   response_time_ms=int((time.time()-start)*1000))
    except: pass
    return jsonify({'manifest': manifest, 'valid': valid, 'message': message})

@app.route('/api/troubleshoot', methods=['POST'])
def troubleshoot_endpoint():
    start = time.time()
    from troubleshooter import analyze_pod_issue, get_pod_logs, get_pod_events
    data = request.json
    pod_name = data.get('pod_name')
    namespace = data.get('namespace', 'default')
    logs = get_pod_logs(pod_name, namespace)
    events = get_pod_events(pod_name, namespace)
    metrics = data.get('metrics', 'No metrics provided')
    analysis = analyze_pod_issue(pod_name, namespace, logs, metrics, events)
    try:
        from audit_logger import log_action
        log_action('troubleshoot_pod', resource_type='Pod',
                   resource_name=pod_name, namespace=namespace,
                   status='success', ai_model='groq/compound-mini',
                   response_time_ms=int((time.time()-start)*1000))
    except: pass
    return jsonify({'pod': pod_name, 'namespace': namespace, 'analysis': analysis})

@app.route('/api/predict-failures', methods=['GET'])
def predict_failures_endpoint():
    start = time.time()
    from predictor import get_predictions
    result = get_predictions()
    try:
        from audit_logger import log_action
        log_action('predict_failures', resource_type='Cluster',
                   status=result.get('status', 'success'),
                   ai_model='groq/compound-mini',
                   response_time_ms=int((time.time()-start)*1000))
    except: pass
    return jsonify(result)

@app.route('/api/remediate', methods=['POST'])
def remediate_endpoint():
    start = time.time()
    from remediator import run_auto_remediation
    result = run_auto_remediation()
    try:
        from audit_logger import log_action
        log_action('auto_remediate', resource_type='Cluster',
                   status='success',
                   details={'pods_scanned': result.get('pods_scanned'),
                            'actions_taken': len(result.get('remediations', []))},
                   ai_model='groq/compound-mini',
                   response_time_ms=int((time.time()-start)*1000))
    except: pass
    return jsonify(result)

@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs_endpoint():
    from audit_logger import get_audit_logs, get_audit_summary
    limit = int(request.args.get('limit', 50))
    action_filter = request.args.get('action')
    namespace_filter = request.args.get('namespace')
    logs = get_audit_logs(limit=limit, action_filter=action_filter,
                          namespace_filter=namespace_filter)
    summary = get_audit_summary()
    return jsonify({'logs': logs, 'summary': summary})

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=True
    )
