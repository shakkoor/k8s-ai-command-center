from locust import HttpUser, task, between

class K8sAIUser(HttpUser):
    wait_time = between(1, 3)
    host = "http://172.27.46.159:5000"

    @task(5)
    def health_check(self):
        """Health endpoint - core availability"""
        self.client.get("/health")

    @task(4)
    def get_pods(self):
        """Live cluster pod data from Kubernetes API"""
        self.client.get("/api/cluster/pods")

    @task(2)
    def predict_failures(self):
        """Predictive failure detection - Prometheus + AI"""
        self.client.get("/api/predict-failures")

    @task(1)
    def audit_logs(self):
        """Audit log retrieval from PostgreSQL"""
        self.client.get("/api/audit-logs")

    @task(3)
    def health_repeated(self):
        """Sustained load simulation"""
        self.client.get("/health")
