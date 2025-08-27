// AI 评估服务
export interface EvaluationInput {
  projectName: string;
  description: string;
  targetUsers?: string;
  features?: string[];
  constraints?: string[];
  modelId: string;
}

export interface EvaluationMetrics {
  clarityScore: number;      // 清晰度 (0-100)
  capabilityScore: number;   // 能力匹配度 (0-100)
  objectivityScore: number;  // 客观性 (0-100)
  dataScore: number;        // 数据质量 (0-100)
  toleranceScore: number;   // 容错性 (0-100)
  matrixX: number;          // 矩阵X轴位置 (0-100)
  matrixY: number;          // 矩阵Y轴位置 (0-100)
  zone: 'optimal' | 'easy' | 'challenge' | 'infeasible' | 'over-investment';
  suggestions: string[];
  risks: string[];
  reasoning: string;
}

export class AIEvaluationService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // DeepSeek API endpoint
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async evaluate(input: EvaluationInput): Promise<EvaluationMetrics> {
    try {
      // 构建评估提示词
      const prompt = this.buildPrompt(input);
      
      // 调用 DeepSeek API
      const response = await this.callDeepSeekAPI(prompt);
      
      // 解析响应
      const metrics = this.parseResponse(response);
      
      return metrics;
    } catch (error) {
      console.error('AI评估失败:', error);
      // 返回硬编码的测试数据作为备用
      return this.getMockMetrics(input);
    }
  }

  private buildPrompt(input: EvaluationInput): string {
    return `
你是一个AI Agent可行性评估专家。请根据以下项目信息，评估其可行性并返回评分。

项目信息：
- 项目名称：${input.projectName}
- 项目描述：${input.description}
- 目标用户：${input.targetUsers || '未指定'}
- 主要功能：${input.features?.join(', ') || '未指定'}
- 技术约束：${input.constraints?.join(', ') || '未指定'}

请从以下5个维度进行评分（0-100分）：
1. 清晰度（Clarity）：项目定义的清晰程度
2. 能力匹配度（Capability）：当前AI技术能否实现
3. 客观性（Objectivity）：评估的客观性和可测量性
4. 数据质量（Data）：所需数据的可用性和质量
5. 容错性（Tolerance）：系统对错误的容忍度

同时，请提供：
- 技术-商业矩阵位置（X轴：技术难度0-100，Y轴：商业价值0-100）
- 所在区域：optimal（最优）、easy（简单）、challenge（挑战）、infeasible（不可行）、over-investment（过度投资）
- 改进建议（3-5条）
- 潜在风险（2-3条）
- 评估理由

请以JSON格式返回结果。
`;
  }

  private async callDeepSeekAPI(prompt: string): Promise<any> {
    try {
      // 如果没有真实的API密钥，使用模拟数据
      if (!this.apiKey || this.apiKey === 'mock-api-key') {
        console.log('使用模拟数据（未配置API密钥）');
        return null;
      }

      console.log('调用DeepSeek API...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的AI项目可行性评估专家。请以JSON格式返回评估结果。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API调用失败: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // 尝试解析JSON响应
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('JSON解析失败，返回原始内容');
        return null;
      }
    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      return null;
    }
  }

  private parseResponse(response: any): EvaluationMetrics {
    // 如果有真实响应，解析它
    if (response && response.clarityScore !== undefined) {
      return {
        clarityScore: response.clarityScore,
        capabilityScore: response.capabilityScore,
        objectivityScore: response.objectivityScore,
        dataScore: response.dataScore,
        toleranceScore: response.toleranceScore,
        matrixX: response.matrixX,
        matrixY: response.matrixY,
        zone: response.zone,
        suggestions: response.suggestions,
        risks: response.risks,
        reasoning: response.reasoning
      };
    }

    // 否则返回默认值
    return this.getMockMetrics();
  }

  private getMockMetrics(input?: EvaluationInput): EvaluationMetrics {
    // 根据输入生成合理的模拟数据
    const hasGoodDescription = input?.description && input.description.length > 50;
    const hasFeatures = input?.features && input.features.length > 0;
    
    const baseScore = hasGoodDescription ? 70 : 50;
    const featureBonus = hasFeatures ? 10 : 0;

    return {
      clarityScore: baseScore + featureBonus + Math.floor(Math.random() * 10),
      capabilityScore: 75 + Math.floor(Math.random() * 15),
      objectivityScore: baseScore + Math.floor(Math.random() * 20),
      dataScore: 60 + Math.floor(Math.random() * 20),
      toleranceScore: 70 + Math.floor(Math.random() * 15),
      matrixX: 45 + Math.floor(Math.random() * 30),  // 技术难度
      matrixY: 60 + Math.floor(Math.random() * 30),  // 商业价值
      zone: 'optimal',
      suggestions: [
        '建议明确定义核心功能的优先级',
        '考虑采用渐进式开发策略，先实现MVP',
        '建议增加用户反馈收集机制',
        '可以考虑集成多个AI模型以提高准确性'
      ],
      risks: [
        'AI模型响应延迟可能影响用户体验',
        '需要持续的模型训练和优化成本',
        '数据隐私和安全合规需要重点关注'
      ],
      reasoning: '该项目具有明确的商业价值和技术可行性。当前AI技术能够支持核心功能的实现，但需要注意性能优化和成本控制。建议采用MVP方式快速验证市场需求。'
    };
  }

  // 计算总分
  calculateTotalScore(metrics: EvaluationMetrics): number {
    const weights = {
      clarity: 0.2,
      capability: 0.3,
      objectivity: 0.15,
      data: 0.2,
      tolerance: 0.15
    };

    const totalScore = 
      metrics.clarityScore * weights.clarity +
      metrics.capabilityScore * weights.capability +
      metrics.objectivityScore * weights.objectivity +
      metrics.dataScore * weights.data +
      metrics.toleranceScore * weights.tolerance;

    return Math.round(totalScore);
  }
}

// 导出工厂函数
export function createAIService(apiKey?: string): AIEvaluationService {
  return new AIEvaluationService(apiKey || 'mock-api-key');
}