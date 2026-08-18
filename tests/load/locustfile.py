from locust import HttpUser, task, between
import json
import random

class K8sAIUser(HttpUser):
    wait_time = between(1, 3)
    host = "http://172.27.46.159:5000"

    @task(3)
    def health_check(self):
        """Most frequent — simple health check"""
        self.client.get("/health")

    @task(3)
    def get_pods(self):
        """Get all cluster pods"""
        self.client.get("/api/cluster/pods")

    @task(2)
    def generate_manifest_deployment(self):
        """Generate a Deployment manifest"""
        apps = ["web-app", "api-server", "cache", "worker", "gateway"]
        images = ["nginx:latest", "node:20", "python:3.11", "redis:7", "alpine:3"]
        self.client.post("/api/generate-manifest", json={
            "workload_type": "Deployment",
            "app_name": random.choice(apps),
            "image": random.choice(images),
            "replicas": random.randint(1, 3),
            "cpu_limit": "100m",
            "memory_limit": "128Mi",
            "port": 8080
        })

    @task(1)
    def generate_manifest_statefulset(self):
        """Generate a StatefulSet manifest"""
        dbs = ["postgres-db", "mysql-db", "mongodb", "redis-cache"]
        images = ["postgres:15", "mysql:8", "mongo:6", "redis:7"]
        idx = random.randint(0, 3)
        self.client.post("/api/generate-manifest", json={
            "workload_type": "StatefulSet",
            "app_name": dbs[idx],
            "image": images[idx],
            "replicas": 1,
            "cpu_limit": "200m",
            "memory_limit": "256Mi",
            "port": 5432
        })

    @task(1)
    def predict_failures(self):
        """Run predictive failure detection"""
        self.client.get("/api/predict-failures")

