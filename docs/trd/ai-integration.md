# AI 模型集成文档

## 1. 概述

### 1.1 集成目标
- **多模型支持**: 集成主流 AI 模型，提供灵活选择
- **成本优化**: 根据任务复杂度智能选择模型
- **高可用性**: 模型故障自动切换，保证服务稳定
- **性能优化**: 缓存、批处理、异步处理
- **统一接口**: 屏蔽不同模型 API 差异

### 1.2 支持模型

| 模型 | 提供商 | 特点 | 适用场景 | 成本等级 |
|------|--------|------|----------|----------|
| GPT-5 | OpenAI | 最新最强、速度快 | 复杂分析、高精度要求 | 高 |
| Claude 4.1 Opus | Anthropic | 深度推理、长文本 | 深度分析、创意任务 | 高 |
| Claude Sonnet 4 | Anthropic | 均衡性能、快速 | 日常任务、快速响应 | 中 |
| DeepSeek 3.1 | DeepSeek | 极致性价比 | 代码生成、技术评估 | 低 |
| Qwen3 | Alibaba | 中文优化、多模态 | 中文场景、本土化 | 低 |

## 2. 模型配置

### 2.1 模型参数配置

```typescript
interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'alibaba';
  endpoint: string;
  model: string;
  features: {
    maxTokens: number;
    maxContextLength: number;
    supportJSON: boolean;
    supportFunctionCall: boolean;
    supportStreaming: boolean;
    speed: 'fast' | 'medium' | 'slow';
    quality: 'excellent' | 'good' | 'standard';
  };
  pricing: {
    inputPer1M: number;  // USD per 1M tokens
    outputPer1M: number; // USD per 1M tokens
  };
  limits: {
    rpm: number;        // Requests per minute
    tpm: number;        // Tokens per minute
    timeout: number;    // Seconds
  };
  recommended: string[]; // 推荐使用场景
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-5': {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-5',
    features: {
      maxTokens: 16384,
      maxContextLength: 128000,
      supportJSON: true,
      supportFunctionCall: true,
      supportStreaming: true,
      speed: 'fast',
      quality: 'excellent'
    },
    pricing: {
      inputPer1M: 12,
      outputPer1M: 36
    },
    limits: {
      rpm: 5000,
      tpm: 800000,
      timeout: 60
    },
    recommended: ['复杂分析', '专业评估', '高准确度要求']
  },
  'claude-4.1-opus': {
    id: 'claude-4.1-opus',
    name: 'Claude 4.1 Opus',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-4.1-opus-20250120',
    features: {
      maxTokens: 4096,
      maxContextLength: 200000,
      supportJSON: true,
      supportFunctionCall: false,
      supportStreaming: true,
      speed: 'medium',
      quality: 'excellent'
    },
    pricing: {
      inputPer1M: 15,
      outputPer1M: 75
    },
    limits: {
      rpm: 1000,
      tpm: 400000,
      timeout: 60
    },
    recommended: ['长文本分析', '深度推理', '创意任务']
  },
  'deepseek-3.1': {
    id: 'deepseek-3.1',
    name: 'DeepSeek 3.1',
    provider: 'deepseek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-3.1',
    features: {
      maxTokens: 8192,
      maxContextLength: 65536,
      supportJSON: true,
      supportFunctionCall: true,
      supportStreaming: true,
      speed: 'fast',
      quality: 'excellent'
    },
    pricing: {
      inputPer1M: 0.27,
      outputPer1M: 1.10
    },
    limits: {
      rpm: 10000,
      tpm: 2000000,
      timeout: 60
    },
    recommended: ['代码生成', '技术评估', '性价比最优']
  }
};
```

### 2.2 环境变量配置

```bash
# .env.local
# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxx

# Alibaba Qwen
QWEN_API_KEY=sk-xxx

# 默认配置
DEFAULT_MODEL=gpt-5
MODEL_TIMEOUT=30
ENABLE_MODEL_FALLBACK=true
ENABLE_RESPONSE_CACHE=true
```

## 3. 统一调用接口

### 3.1 抽象接口设计

```typescript
abstract class AIModelProvider {
  protected config: ModelConfig;
  protected apiKey: string;
  
  constructor(config: ModelConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }
  
  // 抽象方法
  abstract complete(prompt: string, options?: CompletionOptions): Promise<CompletionResponse>;
  abstract streamComplete(prompt: string, options?: CompletionOptions): AsyncGenerator<string>;
  
  // 通用方法
  async validateResponse(response: any): Promise<boolean> {
    return response && response.content;
  }
  
  calculateCost(tokens: { input: number; output: number }): number {
    const { pricing } = this.config;
    return (tokens.input * pricing.inputPer1M / 1000000) + 
           (tokens.output * pricing.outputPer1M / 1000000);
  }
}
```

### 3.2 OpenAI 实现

```typescript
class OpenAIProvider extends AIModelProvider {
  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResponse> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Organization': process.env.OPENAI_ORG_ID
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || this.config.features.maxTokens,
        response_format: options.responseFormat || { type: 'text' },
        ...options.additionalParams
      })
    });
    
    if (!response.ok) {
      throw new AIModelError(`OpenAI API error: ${response.statusText}`, response.status);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: this.config.id,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      cost: this.calculateCost({
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens
      })
    };
  }
  
  async *streamComplete(prompt: string, options: CompletionOptions = {}): AsyncGenerator<string> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        ...options.additionalParams
      })
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}
```

### 3.3 Anthropic 实现

```typescript
class AnthropicProvider extends AIModelProvider {
  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResponse> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.features.maxTokens,
        temperature: options.temperature || 0.7,
        ...options.additionalParams
      })
    });
    
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: this.config.id,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      cost: this.calculateCost({
        input: data.usage.input_tokens,
        output: data.usage.output_tokens
      })
    };
  }
}
```

## 4. 提示词工程

### 4.1 评估提示词模板

```typescript
const EVALUATION_PROMPT_TEMPLATE = `
你是一位资深的 AI Agent 开发专家，拥有超过10年的人工智能项目评估经验。
请根据以下项目信息，从专业角度进行全面的可行性评估。

## 项目信息
项目名称：{{projectName}}
项目描述：{{description}}
目标用户：{{targetUsers}}
预期功能：{{features}}
技术约束：{{constraints}}

## 评估要求

### 1. 维度评分（0-100分）
请从以下5个关键维度进行精确评分，并说明评分理由：

1. **任务定义清晰度**
   - 任务边界是否明确
   - 输入输出是否标准化
   - 成功标准是否可量化

2. **LLM能力匹配度**
   - 现有模型技术是否能够胜任
   - 是否需要特殊的模型能力
   - 技术成熟度如何

3. **评估标准客观性**
   - 成功标准是否可量化
   - 是否有明确的验收标准
   - 质量如何衡量

4. **样例数据充足性**
   - 是否有足够的训练数据
   - 测试数据是否充分
   - 数据质量如何

5. **失败容错成本**
   - 错误的后果是否可接受
   - 是否有补救机制
   - 用户容忍度如何

### 2. 能力矩阵定位
基于评分结果，确定项目在能力矩阵中的位置：
- X轴（0-100）：LLM能力成熟度
- Y轴（0-100）：业务需求复杂度
- 区域：optimal（最优）/ easy（简单）/ challenge（挑战）/ infeasible（不可行）/ over-investment（过度投资）

### 3. 建议与风险
- 提供3-5条具体可行的建议
- 识别3-5个主要风险点
- 给出风险缓解措施

### 4. ROI分析
- 预估开发成本（USD）
- 月度运营成本（USD）
- 预期月收益（USD）
- 投资回收期（月）

## 输出格式
请严格按照以下JSON格式输出，确保可以直接解析：

\`\`\`json
{
  "totalScore": <0-100的整数>,
  "dimensions": {
    "clarity": <0-100>,
    "capability": <0-100>,
    "objectivity": <0-100>,
    "data": <0-100>,
    "tolerance": <0-100>
  },
  "matrixPosition": {
    "x": <0-100>,
    "y": <0-100>,
    "zone": "<区域名称>"
  },
  "suggestions": [
    "<建议1>",
    "<建议2>",
    "<建议3>"
  ],
  "risks": [
    "<风险1>",
    "<风险2>",
    "<风险3>"
  ],
  "roi": {
    "developmentCost": <数字>,
    "operationalCost": <数字>,
    "expectedBenefit": <数字>,
    "paybackPeriod": <数字>
  },
  "reasoning": "<评估理由说明>"
}
\`\`\`
`;
```

### 4.2 提示词优化策略

```typescript
class PromptOptimizer {
  // 根据模型特性优化提示词
  static optimize(prompt: string, modelId: string): string {
    const optimizations = {
      'gpt-5': {
        prefix: 'You are an expert AI evaluator. Be concise and accurate.\n',
        suffix: '\nProvide JSON response only.',
        temperature: 0.7
      },
      'claude-4.1-opus': {
        prefix: 'As an experienced AI specialist, analyze the following:\n',
        suffix: '\nReturn a well-structured JSON response.',
        temperature: 0.6
      },
      'deepseek-3.1': {
        prefix: '作为AI专家，请分析：\n',
        suffix: '\n请返回JSON格式的评估结果。',
        temperature: 0.8
      }
    };
    
    const opt = optimizations[modelId] || optimizations['gpt-5'];
    return opt.prefix + prompt + opt.suffix;
  }
  
  // 动态变量替换
  static fillTemplate(template: string, variables: Record<string, any>): string {
    let filled = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      filled = filled.replace(new RegExp(placeholder, 'g'), 
        Array.isArray(value) ? value.join('、') : String(value));
    }
    
    return filled;
  }
  
  // 上下文增强
  static enhanceWithContext(prompt: string, context: any): string {
    const examples = this.findSimilarExamples(context);
    
    if (examples.length > 0) {
      prompt += '\n\n## 类似案例参考\n';
      examples.forEach((ex, i) => {
        prompt += `${i + 1}. ${ex.name}：评分${ex.score}，${ex.zone}区域\n`;
      });
    }
    
    return prompt;
  }
}
```

## 5. 模型选择策略

### 5.1 智能路由

```typescript
class ModelRouter {
  // 根据任务特征选择最优模型
  static selectModel(task: EvaluationTask): string {
    const scores: Record<string, number> = {};
    
    // 评估各模型适配度
    for (const [modelId, config] of Object.entries(MODEL_CONFIGS)) {
      let score = 0;
      
      // 复杂度匹配
      if (task.complexity === 'high' && config.features.quality === 'excellent') {
        score += 30;
      } else if (task.complexity === 'medium' && config.features.quality === 'good') {
        score += 30;
      } else if (task.complexity === 'low' && config.features.quality === 'standard') {
        score += 30;
      }
      
      // 响应速度要求
      if (task.urgency === 'high' && config.features.speed === 'fast') {
        score += 20;
      }
      
      // 成本考虑
      const costScore = 100 - (config.pricing.inputPer1M + config.pricing.outputPer1M);
      score += costScore * 0.3;
      
      // 语言优化
      if (task.language === 'zh' && modelId === 'qwen3') {
        score += 20;
      }
      
      // 长文本需求
      if (task.tokenCount > 50000 && config.features.maxContextLength > 100000) {
        score += 15;
      }
      
      scores[modelId] = score;
    }
    
    // 返回得分最高的模型
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];
  }
  
  // 成本优化选择
  static selectByCost(budget: number, estimatedTokens: number): string {
    const affordableModels = Object.entries(MODEL_CONFIGS)
      .filter(([, config]) => {
        const cost = (estimatedTokens * config.pricing.inputPer1M / 1000000) +
                    (estimatedTokens * 0.5 * config.pricing.outputPer1M / 1000000);
        return cost <= budget;
      })
      .sort(([, a], [, b]) => {
        // 在预算内选择质量最好的
        const qualityScore = { excellent: 3, good: 2, standard: 1 };
        return qualityScore[b.features.quality] - qualityScore[a.features.quality];
      });
    
    return affordableModels[0]?.[0] || 'deepseek-3.1'; // 默认最便宜的
  }
}
```

### 5.2 故障转移

```typescript
class ModelFallback {
  private static fallbackChain = {
    'gpt-5': ['claude-sonnet-4', 'deepseek-3.1'],
    'claude-4.1-opus': ['gpt-5', 'claude-sonnet-4'],
    'claude-sonnet-4': ['gpt-5', 'deepseek-3.1'],
    'deepseek-3.1': ['qwen3', 'claude-sonnet-4'],
    'qwen3': ['deepseek-3.1', 'claude-sonnet-4']
  };
  
  static async executeWithFallback(
    primaryModel: string, 
    task: () => Promise<any>
  ): Promise<any> {
    const models = [primaryModel, ...this.fallbackChain[primaryModel]];
    const errors: Error[] = [];
    
    for (const modelId of models) {
      try {
        console.log(`Trying model: ${modelId}`);
        const result = await task();
        
        // 记录成功
        await this.recordSuccess(modelId);
        return result;
      } catch (error) {
        console.error(`Model ${modelId} failed:`, error);
        errors.push(error);
        
        // 记录失败
        await this.recordFailure(modelId, error);
        
        // 如果是最后一个模型，抛出聚合错误
        if (modelId === models[models.length - 1]) {
          throw new AggregateError(errors, 'All models failed');
        }
      }
    }
  }
  
  private static async recordSuccess(modelId: string) {
    // 更新模型健康度
    await env.KV.put(`model:health:${modelId}`, JSON.stringify({
      status: 'healthy',
      lastSuccess: Date.now(),
      successRate: 0.95
    }), { expirationTtl: 3600 });
  }
  
  private static async recordFailure(modelId: string, error: Error) {
    // 更新模型健康度
    const health = await env.KV.get(`model:health:${modelId}`, 'json') || {};
    health.status = 'degraded';
    health.lastFailure = Date.now();
    health.lastError = error.message;
    health.successRate = (health.successRate || 1) * 0.9;
    
    await env.KV.put(`model:health:${modelId}`, JSON.stringify(health), {
      expirationTtl: 3600
    });
  }
}
```

## 6. 响应处理

### 6.1 响应解析

```typescript
class ResponseParser {
  // 解析 JSON 响应
  static parseJSON(response: string): any {
    // 尝试直接解析
    try {
      return JSON.parse(response);
    } catch (e) {
      // 尝试提取 JSON 块
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // 尝试修复常见错误
      const fixed = this.fixCommonJSONErrors(response);
      return JSON.parse(fixed);
    }
  }
  
  // 修复常见 JSON 错误
  private static fixCommonJSONErrors(json: string): string {
    return json
      .replace(/,\s*}/g, '}')      // 移除尾随逗号
      .replace(/,\s*]/g, ']')      // 移除数组尾随逗号
      .replace(/'/g, '"')          // 单引号转双引号
      .replace(/(\w+):/g, '"$1":') // 给键加引号
      .replace(/:\s*undefined/g, ': null'); // undefined 转 null
  }
  
  // 验证响应格式
  static validateResponse(response: any, schema: any): boolean {
    // 使用 Zod 验证
    try {
      schema.parse(response);
      return true;
    } catch (error) {
      console.error('Response validation failed:', error);
      return false;
    }
  }
}
```

### 6.2 响应后处理

```typescript
class ResponsePostProcessor {
  // 标准化评分
  static normalizeScores(scores: Record<string, number>): Record<string, number> {
    const normalized = {};
    
    for (const [key, value] of Object.entries(scores)) {
      // 确保在 0-100 范围内
      normalized[key] = Math.max(0, Math.min(100, Math.round(value)));
    }
    
    return normalized;
  }
  
  // 增强建议
  static enhanceSuggestions(suggestions: string[]): string[] {
    return suggestions.map(s => {
      // 添加可操作性
      if (!s.includes('建议')) {
        s = '建议：' + s;
      }
      
      // 添加优先级
      if (suggestions.indexOf(s) === 0) {
        s = '【高优先级】' + s;
      } else if (suggestions.indexOf(s) === suggestions.length - 1) {
        s = '【可选】' + s;
      }
      
      return s;
    });
  }
  
  // 计算置信度
  static calculateConfidence(result: EvaluationResult): number {
    const factors = [
      result.dimensions.clarity / 100 * 0.3,
      result.dimensions.objectivity / 100 * 0.3,
      result.dimensions.data / 100 * 0.2,
      (result.suggestions.length >= 3 ? 1 : 0.5) * 0.1,
      (result.risks.length >= 2 ? 1 : 0.5) * 0.1
    ];
    
    return Math.round(factors.reduce((a, b) => a + b, 0) * 100);
  }
}
```

## 7. 成本控制

### 7.1 成本追踪

```typescript
class CostTracker {
  // 记录API调用成本
  static async trackUsage(
    modelId: string, 
    tokens: { input: number; output: number },
    userId: string
  ): Promise<void> {
    const config = MODEL_CONFIGS[modelId];
    const cost = (tokens.input * config.pricing.inputPer1M / 1000000) +
                (tokens.output * config.pricing.outputPer1M / 1000000);
    
    // 记录到数据库
    await env.DB.prepare(`
      INSERT INTO api_logs (user_id, model_id, request_tokens, response_tokens, cost, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, modelId, tokens.input, tokens.output, cost).run();
    
    // 更新用户额度
    await this.updateUserCredits(userId, cost);
    
    // 检查成本告警
    await this.checkCostAlert(userId, cost);
  }
  
  // 获取成本统计
  static async getCostStats(userId: string, period: 'day' | 'month'): Promise<CostStats> {
    const query = period === 'day' 
      ? "DATE(created_at) = DATE('now')"
      : "DATE(created_at) >= DATE('now', 'start of month')";
    
    const result = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calls,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        MAX(cost) as max_cost,
        model_id,
        COUNT(*) as model_calls
      FROM api_logs
      WHERE user_id = ? AND ${query}
      GROUP BY model_id
    `).bind(userId).all();
    
    return {
      totalCalls: result.results.reduce((sum, r) => sum + r.total_calls, 0),
      totalCost: result.results.reduce((sum, r) => sum + r.total_cost, 0),
      avgCost: result.results.reduce((sum, r) => sum + r.avg_cost, 0) / result.results.length,
      byModel: result.results.map(r => ({
        modelId: r.model_id,
        calls: r.model_calls,
        cost: r.total_cost
      }))
    };
  }
}
```

### 7.2 成本优化

```typescript
class CostOptimizer {
  // Token 优化
  static optimizeTokens(prompt: string): string {
    // 移除多余空白
    prompt = prompt.replace(/\s+/g, ' ').trim();
    
    // 压缩重复内容
    prompt = this.compressRepetitions(prompt);
    
    // 移除冗余说明
    prompt = this.removeRedundancy(prompt);
    
    return prompt;
  }
  
  // 批处理优化
  static async batchProcess(tasks: EvaluationTask[]): Promise<any[]> {
    // 按模型分组
    const grouped = tasks.reduce((acc, task) => {
      const model = ModelRouter.selectModel(task);
      if (!acc[model]) acc[model] = [];
      acc[model].push(task);
      return acc;
    }, {});
    
    // 并发处理
    const results = await Promise.all(
      Object.entries(grouped).map(async ([model, tasks]) => {
        // 批量调用可以减少开销
        return this.batchCall(model, tasks);
      })
    );
    
    return results.flat();
  }
  
  // 缓存策略
  static async withCache<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = 3600
  ): Promise<T> {
    // 检查缓存
    const cached = await env.KV.get(key, 'json');
    if (cached) {
      console.log('Cache hit:', key);
      return cached as T;
    }
    
    // 执行函数
    const result = await fn();
    
    // 写入缓存
    await env.KV.put(key, JSON.stringify(result), { expirationTtl: ttl });
    
    return result;
  }
}
```

## 8. 监控与告警

### 8.1 模型健康监控

```typescript
class ModelHealthMonitor {
  static async checkHealth(): Promise<ModelHealthStatus> {
    const status: ModelHealthStatus = {};
    
    for (const modelId of Object.keys(MODEL_CONFIGS)) {
      const health = await this.pingModel(modelId);
      status[modelId] = {
        available: health.success,
        latency: health.latency,
        successRate: await this.getSuccessRate(modelId),
        lastCheck: Date.now()
      };
    }
    
    return status;
  }
  
  private static async pingModel(modelId: string): Promise<PingResult> {
    const start = Date.now();
    
    try {
      const provider = ModelFactory.create(modelId);
      const response = await provider.complete('ping', { maxTokens: 10 });
      
      return {
        success: true,
        latency: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - start,
        error: error.message
      };
    }
  }
  
  static async alert(issue: ModelIssue): Promise<void> {
    // 发送告警
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: issue.severity,
        model: issue.modelId,
        message: issue.message,
        timestamp: Date.now()
      })
    });
  }
}
```

## 9. 测试模拟

### 9.1 模型模拟器

```typescript
class ModelSimulator {
  static async simulate(modelId: string, prompt: string): Promise<CompletionResponse> {
    // 模拟响应延迟
    await this.simulateLatency(modelId);
    
    // 生成模拟响应
    const response = this.generateMockResponse(prompt);
    
    // 模拟token计算
    const tokens = this.calculateTokens(prompt, response);
    
    return {
      content: response,
      model: modelId,
      usage: tokens,
      cost: 0 // 模拟不计费
    };
  }
  
  private static async simulateLatency(modelId: string) {
    const latencies = {
      'gpt-5': 500,
      'claude-4.1-opus': 800,
      'deepseek-3.1': 300
    };
    
    await new Promise(resolve => 
      setTimeout(resolve, latencies[modelId] || 500)
    );
  }
  
  private static generateMockResponse(prompt: string): string {
    return JSON.stringify({
      totalScore: Math.floor(Math.random() * 30) + 70,
      dimensions: {
        clarity: Math.floor(Math.random() * 20) + 80,
        capability: Math.floor(Math.random() * 20) + 80,
        objectivity: Math.floor(Math.random() * 30) + 70,
        data: Math.floor(Math.random() * 20) + 80,
        tolerance: Math.floor(Math.random() * 20) + 80
      },
      suggestions: [
        '建议先从小规模试点开始',
        '需要准备充足的训练数据',
        '考虑引入人工审核机制'
      ],
      risks: [
        '模型可能产生不准确的内容',
        '需要持续的维护和优化'
      ]
    });
  }
}
```

## 10. 最佳实践

### 10.1 调用建议

1. **模型选择**
   - 简单任务优先使用低成本模型
   - 关键业务使用高质量模型
   - 批量任务考虑性价比

2. **提示词优化**
   - 明确具体的指令
   - 提供充分的上下文
   - 使用少样本学习

3. **错误处理**
   - 实现自动重试机制
   - 设置合理的超时时间
   - 记录详细的错误日志

4. **成本控制**
   - 启用响应缓存
   - 优化 token 使用
   - 监控使用量和成本

5. **性能优化**
   - 使用流式响应
   - 实现并发调用
   - 合理设置批处理大小

## 11. 文档维护

**版本**: v1.0.0  
**最后更新**: 2025年1月  
**下次评审**: 2025年2月  
**负责人**: AI 架构师