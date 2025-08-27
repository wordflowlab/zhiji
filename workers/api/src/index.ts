import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAIService, type EvaluationInput } from './services/ai';

// 环境类型定义
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
  DEEPSEEK_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 配置
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://zhiji.ai',
    'https://zhiji.150404.xyz',
    'https://*.zhiji.pages.dev',
    /^https:\/\/[a-z0-9]+\.zhiji\.pages\.dev$/
  ],
  credentials: true,
}));

// 健康检查端点
app.get('/health', async (c) => {
  try {
    // 测试数据库连接
    const result = await c.env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
    return c.json({ 
      status: 'ok',
      service: 'zhiji-api',
      timestamp: new Date().toISOString(),
      database: 'connected',
      userCount: result?.count || 0
    });
  } catch (error) {
    return c.json({ 
      status: 'ok',
      service: 'zhiji-api',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error.message
    });
  }
});

// 根路径
app.get('/', (c) => {
  return c.json({ 
    message: '知几 API 服务',
    version: '1.0.0' 
  });
});

// API 路由组
const api = new Hono<{ Bindings: Bindings }>();

// 评估相关端点
api.post('/evaluations', async (c) => {
  try {
    const body = await c.req.json();
    const id = 'eval_' + Math.random().toString(36).substr(2, 9);
    
    // 插入到数据库
    await c.env.DB.prepare(`
      INSERT INTO evaluations (id, user_id, project_name, description, target_users, features, constraints, model_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      'user_demo', // 暂时使用固定用户ID
      body.projectName || '',
      body.description || '',
      body.targetUsers || '',
      JSON.stringify(body.features || []),
      JSON.stringify(body.constraints || []),
      body.modelId || 'gpt-5',
      'processing'  // 改为 processing 状态
    ).run();
    
    // 调用 AI 服务进行评估
    const aiService = createAIService(c.env.DEEPSEEK_API_KEY);
    const evaluationInput: EvaluationInput = {
      projectName: body.projectName,
      description: body.description,
      targetUsers: body.targetUsers,
      features: body.features,
      constraints: body.constraints,
      modelId: body.modelId || 'gpt-5'
    };
    
    const metrics = await aiService.evaluate(evaluationInput);
    const totalScore = aiService.calculateTotalScore(metrics);
    
    // 保存评估指标
    const metricsId = 'metric_' + Math.random().toString(36).substr(2, 9);
    await c.env.DB.prepare(`
      INSERT INTO evaluation_metrics (
        id, evaluation_id, clarity_score, capability_score, objectivity_score,
        data_score, tolerance_score, matrix_x, matrix_y, zone,
        suggestions, risks, reasoning
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      metricsId,
      id,
      metrics.clarityScore,
      metrics.capabilityScore,
      metrics.objectivityScore,
      metrics.dataScore,
      metrics.toleranceScore,
      metrics.matrixX,
      metrics.matrixY,
      metrics.zone,
      JSON.stringify(metrics.suggestions),
      JSON.stringify(metrics.risks),
      metrics.reasoning
    ).run();
    
    // 更新评估状态和总分
    await c.env.DB.prepare(`
      UPDATE evaluations 
      SET status = 'completed', total_score = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(totalScore, id).run();
    
    return c.json({
      id,
      status: 'completed',
      message: '评估已完成',
      totalScore,
      metrics,
      ...body
    }, 201);
  } catch (error) {
    console.error('创建评估失败:', error);
    return c.json({ error: '创建评估失败' }, 500);
  }
});

// 获取所有评估
api.get('/evaluations', async (c) => {
  try {
    const evaluations = await c.env.DB.prepare(`
      SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 10
    `).all();
    
    return c.json({
      data: evaluations.results || [],
      total: evaluations.results?.length || 0
    });
  } catch (error) {
    console.error('获取评估列表失败:', error);
    return c.json({ error: '获取评估列表失败' }, 500);
  }
});

api.get('/evaluations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 从数据库获取评估
    const evaluation = await c.env.DB.prepare(`
      SELECT * FROM evaluations WHERE id = ?
    `).bind(id).first();
    
    if (!evaluation) {
      return c.json({ error: '评估不存在' }, 404);
    }
    
    // 获取评估指标
    const metrics = await c.env.DB.prepare(`
      SELECT * FROM evaluation_metrics WHERE evaluation_id = ?
    `).bind(id).first();
    
    return c.json({
      ...evaluation,
      features: evaluation.features ? JSON.parse(evaluation.features) : [],
      constraints: evaluation.constraints ? JSON.parse(evaluation.constraints) : [],
      metrics: metrics || null
    });
  } catch (error) {
    console.error('获取评估失败:', error);
    return c.json({ error: '获取评估失败' }, 500);
  }
});

// 挂载 API 路由
app.route('/api', api);

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;