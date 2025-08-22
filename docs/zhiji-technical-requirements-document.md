# 知几（ZhiJi）- AI Agent 可行性评估平台技术需求文档（TRD）

## 1. 文档信息

- **项目名称**: 知几（ZhiJi）
- **版本**: v1.0
- **日期**: 2025年1月
- **作者**: 技术架构团队
- **状态**: 初稿
- **相关文档**: agent-feasibility-evaluator-prd.md

## 2. 技术概述

### 2.1 系统定位
知几是一个基于 Cloudflare 生态的全栈 Web 应用，采用边缘计算架构，实现全球低延迟访问。系统核心是通过多个 AI 模型对用户提交的 Agent 项目进行可行性评估。

### 2.2 技术目标
- **性能目标**: 首屏加载 <2s，API 响应 <500ms（边缘节点）
- **可用性**: 99.9% SLA
- **并发能力**: 支持 10,000 QPS
- **全球部署**: 利用 Cloudflare 200+ 边缘节点
- **成本优化**: 月度运营成本 <$500（1万次评估）

### 2.3 技术约束
- 必须使用 Cloudflare 生态（客户要求）
- 前端必须支持 SSR/SSG 以优化 SEO
- 必须支持多语言（初期中英文）
- 必须符合 GDPR 合规要求

## 3. 系统架构设计

### 3.1 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                             │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Edge Network                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Cloudflare Pages                     │   │
│  │              (Next.js Static + Edge SSR)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Cloudflare Workers                    │   │
│  │                   (API Gateway)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Evaluation │  │   User     │  │   Report   │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │   D1   │  │   KV   │  │   R2   │  │ Queues │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │  GPT-5 │  │ Claude │  │DeepSeek│  │  Qwen  │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 技术栈详细说明

#### 前端技术栈
```typescript
{
  "framework": "Next.js 14.2.0",
  "language": "TypeScript 5.3",
  "styling": {
    "css": "Tailwind CSS 3.4",
    "components": "shadcn/ui",
    "animations": "Framer Motion 11.0"
  },
  "state": {
    "client": "Zustand 4.5",
    "server": "TanStack Query 5.0"
  },
  "forms": {
    "validation": "Zod 3.22",
    "handling": "React Hook Form 7.50"
  },
  "charts": "Recharts 2.10",
  "testing": {
    "unit": "Vitest 1.2",
    "e2e": "Playwright 1.41"
  }
}
```

#### 后端技术栈（Cloudflare Workers）
```typescript
{
  "runtime": "Cloudflare Workers",
  "language": "TypeScript",
  "framework": "Hono 4.0",
  "validation": "Zod",
  "auth": "JWT + Cloudflare Access",
  "database": {
    "primary": "Cloudflare D1 (SQLite)",
    "cache": "Cloudflare KV",
    "files": "Cloudflare R2",
    "queue": "Cloudflare Queues",
    "realtime": "Durable Objects"
  }
}
```

## 4. 数据库设计

### 4.1 D1 Database Schema

```sql
-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- user, admin, vip
    credits INTEGER DEFAULT 10, -- 免费额度
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 评估任务表
CREATE TABLE evaluations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    project_name TEXT NOT NULL,
    description TEXT NOT NULL,
    target_users TEXT,
    model_id TEXT NOT NULL, -- gpt-5, claude-4.1-opus, etc
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    total_score INTEGER,
    dimensions TEXT, -- JSON: {clarity, capability, objectivity, data, tolerance}
    matrix_position TEXT, -- JSON: {x, y, zone}
    suggestions TEXT, -- JSON array
    risks TEXT, -- JSON array
    roi_analysis TEXT, -- JSON
    processing_time INTEGER, -- milliseconds
    api_cost REAL, -- USD
    is_public BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX idx_evaluations_total_score ON evaluations(total_score);
CREATE INDEX idx_evaluations_is_public ON evaluations(is_public);
CREATE INDEX idx_evaluations_is_featured ON evaluations(is_featured);

-- 评估指标表
CREATE TABLE evaluation_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation_id TEXT UNIQUE NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    feedback_positive INTEGER DEFAULT 0,
    feedback_negative INTEGER DEFAULT 0,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

-- API 调用日志表
CREATE TABLE api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    evaluation_id TEXT,
    model_id TEXT NOT NULL,
    request_tokens INTEGER,
    response_tokens INTEGER,
    cost REAL,
    latency INTEGER, -- milliseconds
    status TEXT, -- success, error
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);

CREATE INDEX idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

-- 反馈表
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation_id TEXT NOT NULL,
    user_id TEXT,
    type TEXT, -- accuracy, suggestion, bug
    content TEXT,
    rating INTEGER, -- 1-5
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 订阅套餐表
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL, -- free, pro, enterprise
    credits_monthly INTEGER,
    credits_used INTEGER DEFAULT 0,
    price_monthly REAL,
    status TEXT DEFAULT 'active', -- active, cancelled, expired
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.2 KV Store 设计

```typescript
// KV 命名空间设计
interface KVNamespaces {
  // 评估结果缓存
  EVALUATION_CACHE: {
    key: `eval:${modelId}:${hash(projectData)}`;
    value: EvaluationResult;
    ttl: 3600; // 1小时
  };
  
  // 用户会话
  USER_SESSION: {
    key: `session:${sessionId}`;
    value: UserSession;
    ttl: 86400; // 24小时
  };
  
  // 限流计数器
  RATE_LIMIT: {
    key: `ratelimit:${userId}:${date}`;
    value: number;
    ttl: 86400;
  };
  
  // 热门案例缓存
  HOT_CASES: {
    key: 'hot:cases';
    value: Array<Case>;
    ttl: 300; // 5分钟
  };
}
```

### 4.3 R2 Storage 结构

```
/
├── reports/              # PDF报告
│   └── {userId}/
│       └── {evaluationId}.pdf
├── exports/              # 导出数据
│   └── {date}/
│       └── evaluations.csv
├── assets/               # 静态资源
│   ├── images/
│   └── documents/
└── backups/              # 数据备份
    └── {date}/
        └── d1-backup.sql
```

## 5. API 设计

### 5.1 RESTful API 端点

```typescript
// API 路由定义
const routes = {
  // 认证相关
  'POST /api/auth/login': 'UserController.login',
  'POST /api/auth/logout': 'UserController.logout',
  'POST /api/auth/refresh': 'UserController.refreshToken',
  'GET /api/auth/profile': 'UserController.getProfile',
  
  // 评估相关
  'POST /api/evaluations': 'EvaluationController.create',
  'GET /api/evaluations': 'EvaluationController.list',
  'GET /api/evaluations/:id': 'EvaluationController.get',
  'DELETE /api/evaluations/:id': 'EvaluationController.delete',
  'POST /api/evaluations/:id/share': 'EvaluationController.share',
  'POST /api/evaluations/:id/feedback': 'EvaluationController.feedback',
  
  // 案例库
  'GET /api/cases': 'CaseController.list',
  'GET /api/cases/featured': 'CaseController.featured',
  'GET /api/cases/hot': 'CaseController.hot',
  
  // 报告生成
  'POST /api/reports/generate': 'ReportController.generate',
  'GET /api/reports/:id': 'ReportController.download',
  
  // 统计分析
  'GET /api/analytics/overview': 'AnalyticsController.overview',
  'GET /api/analytics/usage': 'AnalyticsController.usage',
  
  // 管理后台
  'GET /api/admin/users': 'AdminController.listUsers',
  'PUT /api/admin/evaluations/:id/feature': 'AdminController.featureCase',
  'GET /api/admin/stats': 'AdminController.getStats',
};
```

### 5.2 API 请求/响应格式

```typescript
// 标准请求格式
interface ApiRequest<T = any> {
  headers: {
    'Authorization': string; // Bearer token
    'Content-Type': 'application/json';
    'X-Request-ID': string;
  };
  body: T;
}

// 标准响应格式
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: number;
    duration: number;
  };
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 5.3 核心 API 实现示例

```typescript
// Workers API 实现 (使用 Hono)
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env }>();

// 中间件配置
app.use('/*', cors());
app.use('/api/*', jwt({ secret: process.env.JWT_SECRET }));

// 评估创建 API
app.post('/api/evaluations', async (c) => {
  const env = c.env;
  
  // 请求验证
  const schema = z.object({
    projectName: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    targetUsers: z.string().optional(),
    modelId: z.enum(['gpt-5', 'claude-4.1-opus', 'claude-sonnet-4', 'deepseek-3.1', 'qwen3'])
  });
  
  const body = await c.req.json();
  const validation = schema.safeParse(body);
  
  if (!validation.success) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: validation.error
      }
    }, 400);
  }
  
  const { projectName, description, targetUsers, modelId } = validation.data;
  const userId = c.get('jwtPayload').sub;
  
  // 检查用户额度
  const user = await env.DB.prepare(
    'SELECT credits FROM users WHERE id = ?'
  ).bind(userId).first();
  
  if (!user || user.credits <= 0) {
    return c.json({
      success: false,
      error: {
        code: 'INSUFFICIENT_CREDITS',
        message: 'No credits remaining'
      }
    }, 402);
  }
  
  // 检查缓存
  const cacheKey = `eval:${modelId}:${await hashData({ projectName, description, targetUsers })}`;
  const cached = await env.KV.get(cacheKey, 'json');
  
  if (cached) {
    return c.json({
      success: true,
      data: cached,
      meta: {
        cached: true,
        timestamp: Date.now()
      }
    });
  }
  
  // 创建评估任务
  const evaluationId = generateId();
  
  await env.DB.prepare(
    `INSERT INTO evaluations (id, user_id, project_name, description, target_users, model_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'processing')`
  ).bind(evaluationId, userId, projectName, description, targetUsers, modelId).run();
  
  // 发送到队列异步处理
  await env.QUEUE.send({
    evaluationId,
    userId,
    projectData: { projectName, description, targetUsers },
    modelId
  });
  
  return c.json({
    success: true,
    data: {
      evaluationId,
      status: 'processing',
      message: 'Evaluation started, results will be available soon'
    }
  }, 202);
});

export default app;
```

## 6. AI 模型集成

### 6.1 模型配置

```typescript
interface ModelConfig {
  id: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'alibaba';
  endpoint: string;
  apiKey: string; // 从环境变量读取
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number; // 秒
  retryAttempts: number;
  costPerToken: {
    input: number;
    output: number;
  };
}

const modelConfigs: Record<string, ModelConfig> = {
  'gpt-5': {
    id: 'gpt-5',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-5',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30,
    retryAttempts: 3,
    costPerToken: {
      input: 0.000012, // $12 per 1M tokens
      output: 0.000036  // $36 per 1M tokens
    }
  },
  'claude-4.1-opus': {
    id: 'claude-4.1-opus',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-4.1-opus-20250120',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30,
    retryAttempts: 3,
    costPerToken: {
      input: 0.000015,
      output: 0.000075
    }
  },
  // ... 其他模型配置
};
```

### 6.2 提示词工程

```typescript
const EVALUATION_PROMPT_TEMPLATE = `
你是一位资深的 AI Agent 开发专家，请根据以下项目信息进行可行性评估。

项目信息：
- 名称：{{projectName}}
- 描述：{{description}}
- 目标用户：{{targetUsers}}

请从以下5个维度进行评分（0-100）：
1. 任务定义清晰度：任务边界是否明确，输入输出是否标准化
2. LLM能力匹配度：现有模型技术是否能够胜任
3. 评估标准客观性：成功标准是否可量化
4. 样例数据充足性：是否有足够的训练和测试数据
5. 失败容错成本：错误的后果是否可接受

输出要求（JSON格式）：
{
  "totalScore": 0-100的整数,
  "dimensions": {
    "clarity": 0-100,
    "capability": 0-100,
    "objectivity": 0-100,
    "data": 0-100,
    "tolerance": 0-100
  },
  "matrixPosition": {
    "x": 0-100, // LLM能力成熟度
    "y": 0-100, // 业务需求复杂度
    "zone": "optimal|easy|challenge|infeasible|over-investment"
  },
  "suggestions": ["建议1", "建议2", "建议3"],
  "risks": ["风险1", "风险2", "风险3"],
  "roi": {
    "developmentCost": 预估开发成本(USD),
    "operationalCost": 月运营成本(USD),
    "expectedBenefit": 预期月收益(USD),
    "paybackPeriod": 回本周期(月)
  }
}
`;
```

## 7. 性能优化策略

### 7.1 前端优化

```typescript
// Next.js 配置优化
const nextConfig = {
  // 启用 SWC 编译器
  swcMinify: true,
  
  // 图片优化
  images: {
    domains: ['cloudflare-ipfs.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 启用实验性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@shadcn/ui'],
  },
  
  // Webpack 优化
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    };
    return config;
  }
};
```

### 7.2 缓存策略

```typescript
// 多级缓存架构
class CacheManager {
  constructor(
    private kv: KVNamespace,
    private localCache: Map<string, any> = new Map()
  ) {}
  
  async get(key: string): Promise<any> {
    // L1: 内存缓存
    if (this.localCache.has(key)) {
      return this.localCache.get(key);
    }
    
    // L2: KV 缓存
    const kvValue = await this.kv.get(key, 'json');
    if (kvValue) {
      this.localCache.set(key, kvValue);
      return kvValue;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // 写入内存缓存
    this.localCache.set(key, value);
    
    // 写入 KV 缓存
    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: ttl
    });
    
    // 内存缓存 LRU 清理
    if (this.localCache.size > 100) {
      const firstKey = this.localCache.keys().next().value;
      this.localCache.delete(firstKey);
    }
  }
}
```

### 7.3 边缘计算优化

```typescript
// Workers 路由优化
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // 静态资源直接返回
    if (url.pathname.startsWith('/static/')) {
      return fetch(request);
    }
    
    // API 路由
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env);
    }
    
    // 页面路由 - 边缘 SSR
    return handleSSR(request, env);
  }
};

// 请求合并优化
class RequestBatcher {
  private batch: Map<string, Promise<any>> = new Map();
  
  async execute(key: string, fn: () => Promise<any>): Promise<any> {
    if (this.batch.has(key)) {
      return this.batch.get(key);
    }
    
    const promise = fn();
    this.batch.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      setTimeout(() => this.batch.delete(key), 100);
    }
  }
}
```

## 8. 安全设计

### 8.1 认证与授权

```typescript
// JWT 认证实现
interface JWTPayload {
  sub: string; // userId
  email: string;
  role: 'user' | 'admin' | 'vip';
  exp: number;
  iat: number;
}

class AuthService {
  private readonly secret: string;
  
  constructor(secret: string) {
    this.secret = secret;
  }
  
  async generateToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时
      iat: Math.floor(Date.now() / 1000)
    };
    
    return await sign(payload, this.secret);
  }
  
  async verifyToken(token: string): Promise<JWTPayload> {
    return await verify(token, this.secret);
  }
}

// RBAC 权限控制
const permissions = {
  user: [
    'evaluation:create',
    'evaluation:read:own',
    'evaluation:delete:own'
  ],
  vip: [
    ...permissions.user,
    'evaluation:unlimited',
    'report:export'
  ],
  admin: [
    ...permissions.vip,
    'evaluation:read:all',
    'evaluation:feature',
    'user:manage'
  ]
};
```

### 8.2 数据安全

```typescript
// 敏感数据加密
class DataEncryption {
  async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.ENCRYPTION_KEY),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  
  async decrypt(encryptedData: string): Promise<string> {
    // 解密实现
  }
}

// SQL 注入防护
class SafeQuery {
  static prepare(query: string, params: any[]): PreparedStatement {
    // 使用参数化查询
    return db.prepare(query).bind(...params);
  }
}
```

### 8.3 限流与防护

```typescript
// 限流实现
class RateLimiter {
  constructor(
    private kv: KVNamespace,
    private limits: { [key: string]: { requests: number; window: number } }
  ) {}
  
  async check(userId: string, action: string): Promise<boolean> {
    const limit = this.limits[action];
    if (!limit) return true;
    
    const key = `ratelimit:${userId}:${action}:${Math.floor(Date.now() / limit.window)}`;
    const current = await this.kv.get(key, 'json') || 0;
    
    if (current >= limit.requests) {
      return false;
    }
    
    await this.kv.put(key, JSON.stringify(current + 1), {
      expirationTtl: limit.window
    });
    
    return true;
  }
}

const rateLimiter = new RateLimiter(env.KV, {
  'evaluation:create': { requests: 10, window: 3600 }, // 10次/小时
  'api:request': { requests: 100, window: 60 } // 100次/分钟
});
```

## 9. 监控与日志

### 9.1 监控指标

```typescript
// 关键性能指标 (KPI)
interface Metrics {
  // 业务指标
  business: {
    dailyActiveUsers: number;
    evaluationsCreated: number;
    conversionRate: number;
    averageScore: number;
  };
  
  // 技术指标
  technical: {
    apiLatency: { p50: number; p95: number; p99: number };
    errorRate: number;
    cacheHitRate: number;
    workerCPUTime: number;
  };
  
  // 成本指标
  cost: {
    apiCalls: { [model: string]: number };
    totalCost: number;
    costPerEvaluation: number;
  };
}

// 监控数据收集
class MetricsCollector {
  async collect(): Promise<Metrics> {
    // 实现数据收集逻辑
  }
  
  async sendToAnalytics(metrics: Metrics): Promise<void> {
    await fetch('https://analytics.cloudflare.com/api/metrics', {
      method: 'POST',
      body: JSON.stringify(metrics)
    });
  }
}
```

### 9.2 日志系统

```typescript
// 结构化日志
class Logger {
  private context: any;
  
  constructor(context: any) {
    this.context = context;
  }
  
  private log(level: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data
    };
    
    console.log(JSON.stringify(logEntry));
    
    // 异步发送到日志服务
    this.sendToLogService(logEntry);
  }
  
  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }
  
  error(message: string, error: Error, data?: any) {
    this.log('ERROR', message, {
      ...data,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
  
  private async sendToLogService(entry: any) {
    // 发送到 Cloudflare Logpush 或其他日志服务
  }
}
```

## 10. 部署方案

### 10.1 CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: zhiji
          directory: ./out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Deploy Workers
        run: |
          npm install -g wrangler
          wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 10.2 环境配置

```toml
# wrangler.toml
name = "zhiji-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
workers_dev = false
route = "api.zhiji.ai/*"

[[env.production.d1_databases]]
binding = "DB"
database_name = "zhiji-prod"
database_id = "xxx-xxx-xxx"

[[env.production.kv_namespaces]]
binding = "KV"
id = "xxx-xxx-xxx"

[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "zhiji-storage"

[[env.production.queues.producers]]
binding = "QUEUE"
queue = "zhiji-evaluation-queue"

[[env.production.durable_objects.bindings]]
name = "WEBSOCKET"
class_name = "WebSocketHandler"

[env.production.vars]
ENVIRONMENT = "production"
DEFAULT_MODEL = "gpt-5"

# Secrets (通过 wrangler secret put 设置)
# OPENAI_API_KEY
# ANTHROPIC_API_KEY
# DEEPSEEK_API_KEY
# QWEN_API_KEY
# JWT_SECRET
# ENCRYPTION_KEY
```

### 10.3 灾备方案

```typescript
// 自动备份策略
class BackupService {
  async performDailyBackup(): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    
    // 1. 备份 D1 数据库
    const dbExport = await this.exportD1Database();
    await env.R2.put(`backups/${date}/d1-backup.sql`, dbExport);
    
    // 2. 备份 KV 数据
    const kvExport = await this.exportKVData();
    await env.R2.put(`backups/${date}/kv-backup.json`, kvExport);
    
    // 3. 清理旧备份（保留30天）
    await this.cleanOldBackups(30);
  }
  
  async restore(date: string): Promise<void> {
    // 恢复逻辑
  }
}

// 故障转移
class FailoverManager {
  async handleFailure(region: string): Promise<void> {
    // 1. 检测故障
    if (await this.isRegionDown(region)) {
      // 2. 切换到备用区域
      await this.switchToBackupRegion();
      
      // 3. 通知运维团队
      await this.notifyOps({
        severity: 'critical',
        message: `Region ${region} is down, switched to backup`
      });
    }
  }
}
```

## 11. 测试策略

### 11.1 单元测试

```typescript
// 使用 Vitest 进行单元测试
import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationService } from './evaluation.service';

describe('EvaluationService', () => {
  let service: EvaluationService;
  
  beforeEach(() => {
    service = new EvaluationService();
  });
  
  it('should calculate total score correctly', () => {
    const dimensions = {
      clarity: 80,
      capability: 90,
      objectivity: 70,
      data: 85,
      tolerance: 75
    };
    
    const totalScore = service.calculateTotalScore(dimensions);
    expect(totalScore).toBe(80); // 加权平均
  });
  
  it('should determine zone correctly', () => {
    const position = { x: 70, y: 60 };
    const zone = service.determineZone(position);
    expect(zone).toBe('optimal');
  });
});
```

### 11.2 集成测试

```typescript
// API 集成测试
import { describe, it, expect } from 'vitest';
import { unstable_dev } from 'wrangler';

describe('API Integration Tests', () => {
  let worker: any;
  
  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    });
  });
  
  afterAll(async () => {
    await worker.stop();
  });
  
  it('should create evaluation successfully', async () => {
    const response = await worker.fetch('/api/evaluations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        projectName: 'Test Project',
        description: 'Test description for AI Agent',
        modelId: 'gpt-5'
      })
    });
    
    expect(response.status).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.evaluationId).toBeDefined();
  });
});
```

### 11.3 E2E 测试

```typescript
// 使用 Playwright 进行 E2E 测试
import { test, expect } from '@playwright/test';

test.describe('知几平台 E2E 测试', () => {
  test('完整评估流程', async ({ page }) => {
    // 1. 访问首页
    await page.goto('https://zhiji.ai');
    
    // 2. 填写项目信息
    await page.fill('[name="projectName"]', '智能客服系统');
    await page.fill('[name="description"]', '基于大模型的智能客服，自动回答用户问题');
    await page.fill('[name="targetUsers"]', '企业客服团队');
    
    // 3. 选择模型
    await page.click('[data-model="gpt-5"]');
    
    // 4. 提交评估
    await page.click('button:has-text("开始智能评估")');
    
    // 5. 等待结果
    await page.waitForSelector('[data-testid="evaluation-result"]', {
      timeout: 10000
    });
    
    // 6. 验证结果
    const score = await page.textContent('[data-testid="total-score"]');
    expect(parseInt(score)).toBeGreaterThan(0);
    expect(parseInt(score)).toBeLessThanOrEqual(100);
  });
});
```

## 12. 性能基准

### 12.1 目标性能指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 首屏加载时间 (FCP) | <1.5s | Lighthouse |
| 可交互时间 (TTI) | <3s | Lighthouse |
| API 响应时间 (P95) | <500ms | Cloudflare Analytics |
| 并发处理能力 | 10,000 QPS | 压力测试 |
| 缓存命中率 | >80% | KV Analytics |
| 错误率 | <0.1% | 监控系统 |
| 可用性 | 99.9% | Uptime 监控 |

### 12.2 压力测试

```bash
# 使用 k6 进行压力测试
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // 预热
    { duration: '5m', target: 1000 }, // 增加负载
    { duration: '10m', target: 5000 }, // 峰值负载
    { duration: '3m', target: 0 },    // 降低负载
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 请求在 500ms 内
    http_req_failed: ['rate<0.01'],   // 错误率小于 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    projectName: 'Test Project',
    description: 'Performance test description',
    modelId: 'gpt-5'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
  };
  
  const response = http.post('https://api.zhiji.ai/evaluations', payload, params);
  
  check(response, {
    'status is 202': (r) => r.status === 202,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## 13. 成本优化

### 13.1 成本分析

```typescript
// 成本计算模型
interface CostModel {
  // Cloudflare 成本
  cloudflare: {
    workers: {
      requests: 0.5, // $0.5 per million requests
      duration: 12.5 // $12.5 per million GB-seconds
    };
    kv: {
      reads: 0.5,  // $0.5 per million reads
      writes: 5.0, // $5 per million writes
      storage: 0.5 // $0.5 per GB/month
    };
    d1: {
      reads: 0.001,  // $0.001 per 1000 reads
      writes: 0.001, // $0.001 per 1000 writes
      storage: 0.25  // $0.25 per GB/month
    };
    r2: {
      storage: 0.015, // $0.015 per GB/month
      classA: 4.5,    // $4.5 per million requests
      classB: 0.36    // $0.36 per million requests
    };
  };
  
  // AI API 成本
  ai: {
    'gpt-5': { input: 12, output: 36 },           // per 1M tokens
    'claude-4.1-opus': { input: 15, output: 75 }, // per 1M tokens
    'deepseek-3.1': { input: 0.27, output: 1.1 }, // per 1M tokens
    'qwen3': { input: 1, output: 2 }              // per 1M tokens
  };
}

// 成本优化器
class CostOptimizer {
  // 智能模型选择
  selectOptimalModel(requirements: any): string {
    // 基于需求复杂度选择性价比最高的模型
    if (requirements.complexity < 30) {
      return 'qwen3'; // 简单任务用便宜模型
    } else if (requirements.complexity < 70) {
      return 'deepseek-3.1'; // 中等任务用性价比模型
    } else {
      return 'gpt-5'; // 复杂任务用高端模型
    }
  }
  
  // 缓存策略优化
  getCacheTTL(dataType: string): number {
    const ttlMap = {
      'evaluation_result': 3600,    // 1小时
      'user_session': 86400,        // 24小时
      'hot_cases': 300,             // 5分钟
      'static_content': 2592000     // 30天
    };
    return ttlMap[dataType] || 600;
  }
}
```

### 13.2 成本监控

```typescript
// 实时成本追踪
class CostTracker {
  async trackAPICall(model: string, tokens: { input: number; output: number }) {
    const cost = this.calculateCost(model, tokens);
    
    await env.DB.prepare(
      `INSERT INTO api_logs (model_id, request_tokens, response_tokens, cost, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(model, tokens.input, tokens.output, cost).run();
    
    // 发送成本告警
    if (cost > 0.1) { // 单次调用超过 $0.1
      await this.sendCostAlert({
        model,
        cost,
        tokens
      });
    }
  }
  
  async getDailyCost(): Promise<number> {
    const result = await env.DB.prepare(
      `SELECT SUM(cost) as total FROM api_logs 
       WHERE DATE(created_at) = DATE('now')`
    ).first();
    
    return result.total || 0;
  }
}
```

## 14. 扩展性设计

### 14.1 插件系统

```typescript
// 插件接口定义
interface Plugin {
  name: string;
  version: string;
  init(context: PluginContext): void;
  execute(data: any): Promise<any>;
  destroy(): void;
}

// 插件管理器
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void {
    plugin.init(this.createContext());
    this.plugins.set(plugin.name, plugin);
  }
  
  async execute(pluginName: string, data: any): Promise<any> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    return await plugin.execute(data);
  }
  
  private createContext(): PluginContext {
    return {
      db: env.DB,
      kv: env.KV,
      logger: new Logger({ plugin: true })
    };
  }
}
```

### 14.2 多租户支持

```typescript
// 租户隔离
class TenantManager {
  async getTenantContext(tenantId: string): Promise<TenantContext> {
    const tenant = await env.DB.prepare(
      'SELECT * FROM tenants WHERE id = ?'
    ).bind(tenantId).first();
    
    return {
      id: tenant.id,
      config: JSON.parse(tenant.config),
      limits: JSON.parse(tenant.limits),
      customizations: JSON.parse(tenant.customizations)
    };
  }
  
  // 数据隔离
  getTableName(baseTable: string, tenantId: string): string {
    return `${tenantId}_${baseTable}`;
  }
  
  // 资源限制
  async checkLimits(tenantId: string, resource: string): Promise<boolean> {
    const context = await this.getTenantContext(tenantId);
    const limit = context.limits[resource];
    const usage = await this.getResourceUsage(tenantId, resource);
    
    return usage < limit;
  }
}
```

## 15. 故障恢复

### 15.1 错误处理策略

```typescript
// 全局错误处理
class ErrorHandler {
  async handle(error: Error, context: any): Promise<Response> {
    // 记录错误
    await this.logError(error, context);
    
    // 错误分类处理
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      }), { status: 400 });
    }
    
    if (error instanceof AuthError) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }), { status: 401 });
    }
    
    if (error instanceof RateLimitError) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests'
        }
      }), { status: 429 });
    }
    
    // 默认服务器错误
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }), { status: 500 });
  }
  
  private async logError(error: Error, context: any): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };
    
    // 发送到监控系统
    await this.sendToMonitoring(errorLog);
  }
}
```

### 15.2 重试机制

```typescript
// 指数退避重试
class RetryManager {
  async execute<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts: number;
      baseDelay: number;
      maxDelay: number;
      shouldRetry?: (error: any) => boolean;
    }
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === options.maxAttempts) {
          break;
        }
        
        if (options.shouldRetry && !options.shouldRetry(error)) {
          throw error;
        }
        
        const delay = Math.min(
          options.baseDelay * Math.pow(2, attempt - 1),
          options.maxDelay
        );
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 16. 文档版本

- **版本**: 1.0.0
- **最后更新**: 2025年1月
- **下次评审**: 2025年2月
- **维护团队**: 技术架构组

## 17. 附录

### 17.1 API 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | GET 请求成功 |
| 201 | 创建成功 | POST 创建资源成功 |
| 202 | 已接受 | 异步处理已开始 |
| 204 | 无内容 | DELETE 成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未授权 | 未登录或 token 失效 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 未找到 | 资源不存在 |
| 429 | 请求过多 | 触发限流 |
| 500 | 服务器错误 | 内部错误 |
| 503 | 服务不可用 | 维护中 |

### 17.2 环境变量清单

```bash
# API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEEPSEEK_API_KEY=sk-xxx
QWEN_API_KEY=sk-xxx

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx

# Security
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx

# Database
D1_DATABASE_ID=xxx
KV_NAMESPACE_ID=xxx
R2_BUCKET_NAME=zhiji-storage

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
ANALYTICS_KEY=xxx

# Feature Flags
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true
ENABLE_MONITORING=true
```

### 17.3 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Next.js 14 文档](https://nextjs.org/docs)
- [Hono 框架文档](https://hono.dev/)
- [项目 GitHub 仓库](https://github.com/zhiji/zhiji-platform)
- [API 文档](https://api.zhiji.ai/docs)
- [监控面板](https://monitor.zhiji.ai)

---

*本文档为知几平台的技术实现指南，将根据开发进展持续更新。*