'use client';

import { useEffect, useState } from 'react';

// 配置 Edge Runtime
export const runtime = 'edge';
import { useParams } from 'next/navigation';
import api, { type Evaluation } from '@/lib/api';
import BrandLogo from '@/components/BrandLogo';
import GlowButton from '@/components/ui/GlowButton';
import CapabilityMatrix from '@/components/CapabilityMatrix';
import Footer from '@/components/Footer';

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const getRecommendation = (score: number) => {
    if (score >= 85) return { text: '✅ 强烈建议开发', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 70) return { text: '⚠️ 谨慎评估', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { text: '❌ 不建议开发', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  useEffect(() => {
    async function fetchEvaluation() {
      try {
        const data = await api.getEvaluation(id);
        setEvaluation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEvaluation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">加载评估结果中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">错误: {error}</p>
          <a href="/evaluation" className="text-purple-600 hover:text-purple-700 hover:underline">
            返回评估页面
          </a>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到评估结果</p>
          <a href="/evaluation" className="text-purple-600 hover:text-purple-700 hover:underline">
            返回评估页面
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <BrandLogo />
            <nav className="flex items-center space-x-2">
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">
                分享
              </button>
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">
                下载报告
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

        {/* 项目信息 */}
        <div className="card-enhanced p-6 mb-6 animate-slide-in">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">项目信息</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">项目名称:</span>
              <span className="flex-1">{evaluation.project_name}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">描述:</span>
              <span className="flex-1">{evaluation.description}</span>
            </div>
            {evaluation.target_users && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-28">目标用户:</span>
                <span className="flex-1">{evaluation.target_users}</span>
              </div>
            )}
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">评估模型:</span>
              <span className="flex-1">{evaluation.model_id}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">评估时间:</span>
              <span className="flex-1">{new Date(evaluation.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>

        {/* 总分 */}
        {evaluation.total_score !== undefined && (
          <div className="card-enhanced p-8 mb-6 animate-slide-in" style={{animationDelay: '0.1s'}}>
            <div className="text-center">
              <div className="text-6xl font-bold text-gradient mb-2 animate-pulse">
                {evaluation.total_score}
              </div>
              <div className="text-gray-500 mb-4">综合评分 / 100</div>
              <div className={`inline-block px-4 py-2 rounded-full border ${getRecommendation(evaluation.total_score).color}`}>
                <span className="font-medium">{getRecommendation(evaluation.total_score).text}</span>
              </div>
            </div>
          </div>
        )}

        {/* 评估指标 */}
        {evaluation.metrics && (
          <>
            <div className="card-enhanced p-6 mb-6 animate-slide-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">评估维度</h2>
              <div className="space-y-4">
                {[
                  { key: 'clarityScore', label: '任务清晰度', value: evaluation.metrics.clarityScore, color: 'from-blue-500 to-blue-600' },
                  { key: 'capabilityScore', label: '能力匹配度', value: evaluation.metrics.capabilityScore, color: 'from-green-500 to-green-600' },
                  { key: 'objectivityScore', label: '评估客观性', value: evaluation.metrics.objectivityScore, color: 'from-purple-500 to-purple-600' },
                  { key: 'dataScore', label: '数据充足性', value: evaluation.metrics.dataScore, color: 'from-yellow-500 to-yellow-600' },
                  { key: 'toleranceScore', label: '容错成本', value: evaluation.metrics.toleranceScore, color: 'from-red-500 to-red-600' }
                ].map((metric, index) => (
                  <div key={metric.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-32">{metric.label}</span>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-1000 ease-out rounded-full`}
                          style={{
                            width: `${metric.value}%`,
                            animationDelay: `${index * 0.1}s`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{metric.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 可行性区域 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">可行性区域</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-semibold">
                    {evaluation.metrics.zone}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 能力矩阵可视化 */}
            <CapabilityMatrix score={evaluation.total_score} />

            {/* 评估理由 */}
            {evaluation.metrics.reasoning && (
              <div className="card-enhanced p-6 mb-6 animate-slide-in" style={{animationDelay: '0.3s'}}>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">评估理由</h2>
                <p className="text-gray-700 leading-relaxed">{evaluation.metrics.reasoning}</p>
              </div>
            )}

            {/* 建议 */}
            {evaluation.metrics.suggestions && evaluation.metrics.suggestions.length > 0 && (
              <div className="card-enhanced p-6 mb-6 animate-slide-in" style={{animationDelay: '0.4s'}}>
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  改进建议
                </h2>
                <ul className="space-y-3">
                  {(typeof evaluation.metrics.suggestions === 'string' 
                    ? JSON.parse(evaluation.metrics.suggestions) 
                    : evaluation.metrics.suggestions
                  ).map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 风险 */}
            {evaluation.metrics.risks && evaluation.metrics.risks.length > 0 && (
              <div className="card-enhanced p-6 mb-6 animate-slide-in" style={{animationDelay: '0.5s'}}>
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  潜在风险
                </h2>
                <ul className="space-y-3">
                  {(typeof evaluation.metrics.risks === 'string' 
                    ? JSON.parse(evaluation.metrics.risks) 
                    : evaluation.metrics.risks
                  ).map((risk: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                      <span className="text-red-600">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-8 pb-8">
          <GlowButton
            onClick={() => window.location.href = '/evaluation'}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          >
            新建评估
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            返回首页
          </GlowButton>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}