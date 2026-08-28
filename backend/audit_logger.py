import os
import json
import psycopg2
from datetime import datetime

def get_db_connection():
    """Connect to PostgreSQL"""
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="auditdb",
        user="postgres",
        password="k8sai2026"
    )

def setup_audit_table():
    """Create audit log table if not exists"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT NOW(),
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(100),
            resource_name VARCHAR(255),
            namespace VARCHAR(100),
            user_agent VARCHAR(255),
            status VARCHAR(50),
            details JSONB,
            ai_model VARCHAR(100),
            response_time_ms INTEGER
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def log_action(action, resource_type=None, resource_name=None, 
               namespace=None, status="success", details=None,
               ai_model=None, response_time_ms=None):
    """Log an action to PostgreSQL"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO audit_logs 
            (action, resource_type, resource_name, namespace, status, details, ai_model, response_time_ms)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            action, resource_type, resource_name, namespace,
            status, json.dumps(details) if details else None,
            ai_model, response_time_ms
        ))
        log_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return log_id
    except Exception as e:
        return None

def get_audit_logs(limit=50, action_filter=None, namespace_filter=None):
    """Retrieve audit logs"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = "SELECT * FROM audit_logs"
        params = []
        conditions = []
        
        if action_filter:
            conditions.append("action = %s")
            params.append(action_filter)
        if namespace_filter:
            conditions.append("namespace = %s")
            params.append(namespace_filter)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY timestamp DESC LIMIT %s"
        params.append(limit)
        
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        logs = []
        for row in rows:
            logs.append({
                'id': row[0],
                'timestamp': row[1].isoformat(),
                'action': row[2],
                'resource_type': row[3],
                'resource_name': row[4],
                'namespace': row[5],
                'user_agent': row[6],
                'status': row[7],
                'details': row[8],
                'ai_model': row[9],
                'response_time_ms': row[10]
            })
        return logs
    except Exception as e:
        return []

def get_audit_summary():
    """Get summary statistics of audit logs"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'success' THEN 1 END) as successes,
                COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
                COUNT(DISTINCT action) as unique_actions,
                MIN(timestamp) as first_log,
                MAX(timestamp) as last_log
            FROM audit_logs
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()
        return {
            'total': row[0],
            'successes': row[1],
            'errors': row[2],
            'unique_actions': row[3],
            'first_log': row[4].isoformat() if row[4] else None,
            'last_log': row[5].isoformat() if row[5] else None
        }
    except Exception as e:
        return {'error': str(e)}

