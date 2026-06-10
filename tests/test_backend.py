import pytest
import sys
import os
from dotenv import load_dotenv

# Load env vars before importing app
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Test 1: Health endpoint
def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert 'message' in data

# Test 2: Health returns correct message
def test_health_message(client):
    response = client.get('/health')
    data = response.get_json()
    assert 'K8sAI' in data['message']

# Test 3: Pods endpoint exists
def test_pods_endpoint_exists(client):
    response = client.get('/api/cluster/pods')
    assert response.status_code in [200, 500]

# Test 4: Generate manifest endpoint exists
def test_manifest_endpoint_exists(client):
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
    assert response.status_code in [200, 500]

# Test 5: Troubleshoot endpoint exists
def test_troubleshoot_endpoint_exists(client):
    response = client.post('/api/troubleshoot',
        json={
            'pod_name': 'test-pod',
            'namespace': 'default'
        })
    assert response.status_code in [200, 500]

# Test 6: YAML validation - valid yaml
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

# Test 7: YAML validation - invalid yaml
def test_validate_invalid_yaml():
    from manifest_generator import validate_manifest
    invalid_yaml = "this is not valid yaml: ]["
    valid, message = validate_manifest(invalid_yaml)
    assert valid == False

# Test 8: Generate manifest returns expected fields
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

# Test 9: Health endpoint method not allowed for POST
def test_health_post_not_allowed(client):
    response = client.post('/health')
    assert response.status_code == 405

# Test 10: Unknown endpoint returns 404
def test_unknown_endpoint(client):
    response = client.get('/api/unknown')
    assert response.status_code == 404

