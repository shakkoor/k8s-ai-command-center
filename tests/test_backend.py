import pytest
import sys
import os
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert 'message' in data

def test_health_message(client):
    response = client.get('/health')
    data = response.get_json()
    assert 'K8sAI' in data['message']

def test_pods_endpoint_exists(client):
    with patch('kubernetes.config.load_kube_config'), \
         patch('kubernetes.client.CoreV1Api') as mock_api:
        mock_pod = MagicMock()
        mock_pod.metadata.name = 'test-pod'
        mock_pod.metadata.namespace = 'default'
        mock_pod.status.phase = 'Running'
        mock_pod.status.container_statuses = [MagicMock(restart_count=0)]
        mock_api.return_value.list_pod_for_all_namespaces.return_value.items = [mock_pod]
        response = client.get('/api/cluster/pods')
        assert response.status_code == 200
        data = response.get_json()
        assert 'pods' in data

def test_manifest_endpoint_returns_fields(client):
    with patch('requests.post') as mock_post:
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: test-app'}}]
        }
        with patch('subprocess.run') as mock_run:
            mock_run.return_value.returncode = 0
            mock_run.return_value.stderr = ''
            response = client.post('/api/generate-manifest',
                json={
                    'workload_type': 'Deployment',
                    'app_name': 'test-app',
                    'image': 'nginx:latest',
                    'replicas': 1,
                    'cpu_limit': '100m',
                    'memory_limit': '128Mi',
                    'port': 80
                })
            assert response.status_code == 200
            data = response.get_json()
            assert 'manifest' in data
            assert 'valid' in data
            assert 'message' in data

def test_troubleshoot_endpoint_exists(client):
    with patch('troubleshooter.analyze_pod_issue') as mock_analyze, \
         patch('troubleshooter.get_pod_logs') as mock_logs, \
         patch('troubleshooter.get_pod_events') as mock_events:
        mock_logs.return_value = "test logs"
        mock_events.return_value = "test events"
        mock_analyze.return_value = "Pod is healthy. No issues found."
        response = client.post('/api/troubleshoot',
            json={'pod_name': 'test-pod', 'namespace': 'default'})
        assert response.status_code == 200
        data = response.get_json()
        assert 'analysis' in data
        assert 'pod' in data

def test_validate_valid_yaml():
    with patch('subprocess.run') as mock_run:
        mock_run.return_value.returncode = 0
        mock_run.return_value.stderr = ''
        from manifest_generator import validate_manifest
        valid_yaml = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
    spec:
      containers:
      - name: test-app
        image: nginx:latest
"""
        valid, message = validate_manifest(valid_yaml)
        assert valid == True

def test_validate_invalid_yaml():
    from manifest_generator import validate_manifest
    invalid_yaml = "this is not valid yaml: ]["
    valid, message = validate_manifest(invalid_yaml)
    assert valid == False

def test_manifest_response_fields(client):
    with patch('requests.post') as mock_post:
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: test'}}]
        }
        with patch('subprocess.run') as mock_run:
            mock_run.return_value.returncode = 0
            mock_run.return_value.stderr = ''
            response = client.post('/api/generate-manifest',
                json={
                    'workload_type': 'Deployment',
                    'app_name': 'test-app',
                    'image': 'nginx:latest',
                    'replicas': 1,
                    'cpu_limit': '100m',
                    'memory_limit': '128Mi',
                    'port': 80
                })
            if response.status_code == 200:
                data = response.get_json()
                assert 'manifest' in data
                assert 'valid' in data
                assert 'message' in data

def test_health_post_not_allowed(client):
    response = client.post('/health')
    assert response.status_code == 405

def test_unknown_endpoint(client):
    response = client.get('/api/unknown')
    assert response.status_code == 404

def test_predict_failures_endpoint(client):
    with patch('predictor.get_predictions') as mock_predict:
        mock_predict.return_value = {
            'status': 'ok',
            'predictions': 'All pods healthy.',
            'metrics_collected': {'cpu_pods': 5, 'memory_pods': 5, 'restart_counts': 10},
            'timestamp': '2026-08-18T10:00:00'
        }
        response = client.get('/api/predict-failures')
        assert response.status_code == 200
        data = response.get_json()
        assert 'predictions' in data
        assert 'status' in data

def test_predictor_with_prometheus_error():
    with patch('requests.get') as mock_get:
        mock_get.side_effect = Exception("Connection refused")
        from predictor import get_prometheus_metrics
        result = get_prometheus_metrics()
        assert 'error' in result

def test_predictor_get_predictions_error():
    with patch('predictor.get_prometheus_metrics') as mock_metrics:
        mock_metrics.return_value = {'error': 'Connection refused'}
        from predictor import get_predictions
        result = get_predictions()
        assert result['status'] == 'error'
        assert 'timestamp' in result

def test_troubleshooter_analyze_with_mock():
    with patch('troubleshooter.Groq') as mock_groq_class:
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Pod crashed due to OOMKilled."
        mock_client.chat.completions.create.return_value = mock_response
        from troubleshooter import analyze_pod_issue
        result = analyze_pod_issue("test-pod", "default", "OOMKilled logs", "memory: 256Mi", "No events")
        assert len(result) > 0

def test_troubleshooter_get_pod_logs_error():
    with patch('kubernetes.config.load_kube_config'), \
         patch('kubernetes.client.CoreV1Api') as mock_api:
        mock_api.return_value.read_namespaced_pod_log.side_effect = Exception("Pod not found")
        from troubleshooter import get_pod_logs
        result = get_pod_logs("nonexistent-pod", "default")
        assert "Could not fetch logs" in result

def test_troubleshooter_get_pod_events_error():
    with patch('kubernetes.config.load_kube_config'), \
         patch('kubernetes.client.CoreV1Api') as mock_api:
        mock_api.return_value.list_namespaced_event.side_effect = Exception("Namespace not found")
        from troubleshooter import get_pod_events
        result = get_pod_events("test-pod", "default")
        assert "Could not fetch events" in result

def test_predictor_predict_failures_with_mock():
    with patch('troubleshooter.Groq') as mock_groq_class:
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "All pods healthy."
        mock_client.chat.completions.create.return_value = mock_response
        from predictor import predict_failures
        result = predict_failures({'restarts': [{'metric': {'pod': 'test-pod'}, 'value': ['', '5']}]})
        assert len(result) > 0


# Tests for new Phase 2 features

def test_nlp_endpoint_status(client):
    with patch('nlp_controller.process_natural_language') as mock_parse, \
         patch('nlp_controller.execute_nlp_action') as mock_exec:
        mock_parse.return_value = {'action': 'STATUS', 'app_name': None, 'namespace': 'default'}
        mock_exec.return_value = {'action': 'STATUS', 'success': True, 'pods': [], 'message': 'Found 0 pods'}
        response = client.post('/api/nlp', json={'command': 'show all pods'})
        assert response.status_code == 200
        data = response.get_json()
        assert 'command' in data
        assert 'result' in data

def test_nlp_endpoint_deploy(client):
    with patch('nlp_controller.process_natural_language') as mock_parse, \
         patch('nlp_controller.execute_nlp_action') as mock_exec:
        mock_parse.return_value = {'action': 'DEPLOY', 'app_name': 'test', 'image': 'nginx', 'replicas': 1, 'namespace': 'default', 'workload_type': 'Deployment', 'memory_limit': '128Mi', 'cpu_limit': '100m', 'port': 80}
        mock_exec.return_value = {'action': 'DEPLOY', 'success': True, 'valid': True, 'manifest': 'apiVersion: v1'}
        response = client.post('/api/nlp', json={'command': 'deploy nginx app'})
        assert response.status_code == 200

def test_estimate_cost_endpoint(client):
    with patch('cost_estimator.estimate_cost') as mock_cost:
        mock_cost.return_value = {
            'app_name': 'test-app',
            'cost_breakdown': {'total_monthly_inr': 280, 'total_monthly_usd': 3.33, 'cpu_cost_inr': 240, 'memory_cost_inr': 40, 'cpu_cores': 0.1, 'memory_gb': 0.125, 'storage_cost_inr': 0},
            'ai_advice': 'Cost looks reasonable.',
            'pricing_note': 'AKS India region'
        }
        response = client.post('/api/estimate-cost', json={
            'app_name': 'test-app', 'workload_type': 'Deployment',
            'replicas': 1, 'cpu_limit': '100m', 'memory_limit': '128Mi'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'cost_breakdown' in data
        assert 'ai_advice' in data

def test_audit_logs_endpoint(client):
    with patch('audit_logger.get_audit_logs') as mock_logs, \
         patch('audit_logger.get_audit_summary') as mock_summary:
        mock_logs.return_value = []
        mock_summary.return_value = {'total': 0, 'successes': 0, 'errors': 0}
        response = client.get('/api/audit-logs')
        assert response.status_code == 200
        data = response.get_json()
        assert 'logs' in data
        assert 'summary' in data

def test_remediate_endpoint(client):
    with patch('remediator.run_auto_remediation_with_alerts') as mock_rem:
        mock_rem.return_value = {
            'pods_scanned': 0,
            'remediations': [],
            'timestamp': '2026-09-02T10:00:00'
        }
        response = client.post('/api/remediate')
        assert response.status_code == 200
        data = response.get_json()
        assert 'pods_scanned' in data
        assert 'remediations' in data

def test_cost_calculator():
    from cost_estimator import calculate_cost
    result = calculate_cost('100m', '128Mi', 1, 'Deployment')
    assert result['total_monthly_inr'] > 0
    assert result['cpu_cores'] == 0.1
    assert result['memory_gb'] == round(128/1024, 3)

def test_cost_calculator_statefulset():
    from cost_estimator import calculate_cost, parse_cpu, parse_memory
    result = calculate_cost('200m', '256Mi', 2, 'StatefulSet')
    assert result['storage_cost_inr'] > 0
    assert result['total_monthly_inr'] > 0



def test_parse_cpu():
    from cost_estimator import parse_cpu
    assert parse_cpu('100m') == 0.1
    assert parse_cpu('500m') == 0.5
    assert parse_cpu('1') == 1.0

def test_parse_memory():
    from cost_estimator import parse_memory
    assert parse_memory('128Mi') == round(128/1024, 3)
    assert parse_memory('1Gi') == 1.0

