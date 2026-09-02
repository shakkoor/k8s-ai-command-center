import os
from groq import Groq

# AKS pricing approximations (India region, pay-as-you-go)
CPU_COST_PER_CORE_MONTH = 2400  # Rs per vCPU per month
MEMORY_COST_PER_GB_MONTH = 320  # Rs per GB per month
STORAGE_COST_PER_GB_MONTH = 8   # Rs per GB per month

def parse_cpu(cpu_str):
    """Convert CPU string to cores"""
    if not cpu_str:
        return 0.1
    if cpu_str.endswith('m'):
        return int(cpu_str[:-1]) / 1000
    return float(cpu_str)

def parse_memory(mem_str):
    """Convert memory string to GB"""
    if not mem_str:
        return 0.128
    if mem_str.endswith('Mi'):
        return int(mem_str[:-2]) / 1024
    if mem_str.endswith('Gi'):
        return int(mem_str[:-2])
    return float(mem_str) / 1024

def calculate_cost(cpu_limit, memory_limit, replicas, workload_type):
    """Calculate estimated monthly cost"""
    cpu_cores = parse_cpu(cpu_limit) * replicas
    memory_gb = parse_memory(memory_limit) * replicas
    
    cpu_cost = cpu_cores * CPU_COST_PER_CORE_MONTH
    memory_cost = memory_gb * MEMORY_COST_PER_GB_MONTH
    
    # Add overhead for StatefulSet (storage)
    storage_cost = 0
    if workload_type == 'StatefulSet':
        storage_cost = 10 * STORAGE_COST_PER_GB_MONTH  # 10GB default
    
    total = cpu_cost + memory_cost + storage_cost
    
    return {
        'cpu_cores': round(cpu_cores, 3),
        'memory_gb': round(memory_gb, 3),
        'cpu_cost_inr': round(cpu_cost, 2),
        'memory_cost_inr': round(memory_cost, 2),
        'storage_cost_inr': round(storage_cost, 2),
        'total_monthly_inr': round(total, 2),
        'total_monthly_usd': round(total / 84, 2),
    }

def get_ai_cost_advice(app_name, workload_type, replicas, cpu_limit, memory_limit, cost_data):
    """Get AI advice on cost optimization"""
    groq = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    prompt = f"""
You are a Kubernetes FinOps expert. Analyze this deployment cost and give optimization advice.

App: {app_name}
Type: {workload_type}
Replicas: {replicas}
CPU limit: {cpu_limit}
Memory limit: {memory_limit}
Estimated monthly cost: Rs. {cost_data['total_monthly_inr']} (${cost_data['total_monthly_usd']})

Give:
1. Cost assessment (is this reasonable?)
2. Top 2 optimization tips to reduce cost
3. Recommended resource limits if they seem over-provisioned

Keep it concise — 3-4 sentences max.
"""
    
    response = groq.chat.completions.create(
        model='groq/compound-mini',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.3,
        max_tokens=200
    )
    
    return response.choices[0].message.content

def estimate_cost(app_name, workload_type, replicas, cpu_limit, memory_limit):
    """Main function — calculate cost and get AI advice"""
    cost_data = calculate_cost(cpu_limit, memory_limit, replicas, workload_type)
    ai_advice = get_ai_cost_advice(app_name, workload_type, replicas, cpu_limit, memory_limit, cost_data)
    
    return {
        'app_name': app_name,
        'workload_type': workload_type,
        'replicas': replicas,
        'resources': {
            'cpu_limit': cpu_limit,
            'memory_limit': memory_limit
        },
        'cost_breakdown': cost_data,
        'ai_advice': ai_advice,
        'pricing_note': 'Estimates based on AKS India region pay-as-you-go pricing'
    }
