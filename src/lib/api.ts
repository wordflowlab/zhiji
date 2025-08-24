// API 客户端库

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

// 类型定义
export interface EvaluationRequest {
  projectName: string;
  description: string;
  targetUsers?: string;
  features?: string[];
  constraints?: string[];
  modelId?: string;
}

export interface EvaluationMetrics {
  clarityScore: number;
  capabilityScore: number;
  objectivityScore: number;
  dataScore: number;
  toleranceScore: number;
  matrixX: number;
  matrixY: number;
  zone: 'optimal' | 'easy' | 'challenge' | 'infeasible' | 'over-investment';
  suggestions: string[];
  risks: string[];
  reasoning: string;
}

export interface EvaluationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  totalScore?: number;
  metrics?: EvaluationMetrics;
  projectName: string;
  description: string;
  targetUsers?: string;
  features?: string[];
  constraints?: string[];
  modelId?: string;
}

export interface Evaluation {
  id: string;
  user_id: string;
  project_name: string;
  description: string;
  target_users?: string;
  features: string[];
  constraints: string[];
  model_id: string;
  status: string;
  total_score?: number;
  created_at: string;
  completed_at?: string;
  metrics?: EvaluationMetrics;
}

// API 错误类
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // 处理响应
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || `请求失败: ${response.statusText}`,
        response.status
      );
    }

    return data;
  } catch (error) {
    // 处理网络错误
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new APIError('网络连接失败，请检查您的网络连接');
    }

    throw new APIError(
      error instanceof Error ? error.message : '未知错误'
    );
  }
}

// API 方法
export const api = {
  // 创建评估
  async createEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
    return request<EvaluationResponse>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取单个评估
  async getEvaluation(id: string): Promise<Evaluation> {
    return request<Evaluation>(`/evaluations/${id}`);
  },

  // 获取评估列表
  async getEvaluations(): Promise<{ data: Evaluation[]; total: number }> {
    return request<{ data: Evaluation[]; total: number }>('/evaluations');
  },

  // 健康检查
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    database: string;
  }> {
    return request<{
      status: string;
      service: string;
      timestamp: string;
      database: string;
    }>('/health');
  },
};

// 导出默认实例
export default api;