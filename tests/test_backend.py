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
    response = client.get('/api/cluster/pods')
    assert response.status_code in [200, 500]

def test_manifest_endpoint_returns_fields(client):
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
            'predictions': 'All pods healthy. No immediate risk detected.',
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
    with patch('groq.Groq') as mock_groq_class:
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Pod crashed due to OOMKilled. Increase memory limit."
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
    with patch('groq.Groq') as mock_groq_class:
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "All pods healthy. No risk detected."
        mock_client.chat.completions.create.return_value = mock_response
        from predictor import predict_failures
        result = predict_failures({'restarts': [{'metric': {'pod': 'test-pod'}, 'value': ['', '5']}]})
        assert len(result) > 0

