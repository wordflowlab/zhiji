'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import GlowButton from '@/components/ui/GlowButton';
import LiveActivityStream from '@/components/LiveActivityStream';
import ExampleCases from '@/components/ExampleCases';
import Footer from '@/components/Footer';
import api, { APIError } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    targetUsers: '',
    features: '',
    constraints: '',
    modelId: 'gpt-5'
  });
  
  const [expandedModel, setExpandedModel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const descriptionMaxLength = 500;

  type ModelInfo = {
    name: string;
    features: string;
    price: string;
    badge?: string;
    badgeColor?: string;
  };

  const modelInfo: Record<string, ModelInfo> = {
    'gpt-5': { name: 'GPT-5', features: '⚡ 速度快 · ⭐ 质量优秀', price: '💰 $0.048/次', badge: '推荐', badgeColor: 'bg-green-100 text-green-800' },
    'claude-4.1-opus': { name: 'Claude 4.1 Opus', features: '🧠 深度推理 · 📝 长文本', price: '💰 $0.09/次' },
    'deepseek-3.1': { name: 'DeepSeek 3.1', features: '💎 极致性价比 · 💻 代码生成', price: '💰 $0.002/次', badge: '性价比', badgeColor: 'bg-blue-100 text-blue-800' },
    'qwen3': { name: 'Qwen3', features: '🇨🇳 中文优化 · 🎨 多模态', price: '💰 $0.003/次' }
  };

  const currentModel = modelInfo[formData.modelId as keyof typeof modelInfo];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const dataToSubmit = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        constraints: formData.constraints.split(',').map(c => c.trim()).filter(c => c)
      };

      const response = await api.createEvaluation(dataToSubmit);
      
      if (response.status === 'completed' && response.id) {
        setMessage(`评估完成！总分: ${response.totalScore}分`);
        setTimeout(() => {
          router.push(`/results/${response.id}`);
        }, 1000);
      } else {
        setMessage('评估已提交，正在处理中...');
      }
      
    } catch (error) {
      console.error('提交失败:', error);
      if (error instanceof APIError) {
        setMessage(error.message);
      } else {
        setMessage('提交失败，请重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExample = (example: { name: string; description: string }) => {
    setFormData({
      ...formData,
      projectName: example.name,
      description: example.description,
      targetUsers: '企业用户'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <BrandLogo />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                案例库
              </button>
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                使用指南
              </button>
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                帮助
              </button>
              
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">
                登录
              </button>
              <GlowButton size="sm">
                免费试用
              </GlowButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Input Form and Live Stream */}
          <div className="lg:col-span-1 space-y-6">
            {/* Input Card */}
            <form onSubmit={handleSubmit} className="card-enhanced p-8 shadow-lg hover:shadow-xl transition-shadow border-2">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                项目信息
              </h2>
              
              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    项目名称
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="input-enhanced"
                    placeholder="例如：智能客服系统"
                    required
                  />
                </div>
                
                {/* Project Description */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    项目描述
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={descriptionMaxLength}
                      className="textarea-enhanced"
                      placeholder="详细描述您的 AI Agent 项目想法，包括：&#10;• 想要解决什么问题&#10;• 主要功能是什么&#10;• 预期效果如何"
                      required
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      <span>{formData.description.length}</span>/{descriptionMaxLength}
                    </div>
                  </div>
                </div>
                
                {/* Target Users */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    目标用户
                  </label>
                  <input
                    type="text"
                    name="targetUsers"
                    value={formData.targetUsers}
                    onChange={handleInputChange}
                    className="input-enhanced"
                    placeholder="例如：企业客服团队"
                  />
                </div>
                
                {/* Model Selection */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    选择评估模型
                  </label>
                  
                  <div onClick={() => setExpandedModel(!expandedModel)} 
                       className="p-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{currentModel.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{currentModel.features}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {currentModel.badge && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${currentModel.badgeColor}`}>
                              {currentModel.badge}
                            </span>
                          )}
                          <div className="text-sm font-semibold text-gray-700 mt-1">{currentModel.price}</div>
                        </div>
                        <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedModel ? 'rotate-180' : ''}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedModel && (
                    <div className="mt-3 space-y-3 animate-slide-in">
                      {Object.entries(modelInfo).map(([value, info]) => (
                        <label key={value} className="block cursor-pointer">
                          <input 
                            type="radio" 
                            name="modelId" 
                            value={value}
                            checked={formData.modelId === value}
                            onChange={(e) => {
                              handleInputChange(e);
                              setExpandedModel(false);
                            }}
                            className="sr-only peer"
                          />
                          <div className="p-4 rounded-lg border-2 border-gray-200 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-800">{info.name}</div>
                                <div className="text-sm text-gray-600 mt-1">{info.features}</div>
                              </div>
                              <div className="text-right">
                                {info.badge && (
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${info.badgeColor}`}>
                                    {info.badge}
                                  </span>
                                )}
                                <div className="text-sm font-semibold text-gray-700 mt-1">{info.price}</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <GlowButton
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    size="lg"
                    glow={true}
                    className="w-full"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                  >
                    {isSubmitting ? '' : '开始智能评估'}
                  </GlowButton>
                  <div className="mt-3 text-center text-sm text-gray-500">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    您的数据安全加密，仅用于评估分析
                  </div>
                </div>
                
                {message && (
                  <div className={`p-4 rounded-lg animate-slide-in ${message.includes('失败') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                    {message}
                  </div>
                )}
              </div>
            </form>
            
            {/* Live Stream Card */}
            <LiveActivityStream />
          </div>
          
          {/* Right Column: Example Cases */}
          <div className="lg:col-span-2">
            <ExampleCases onLoadExample={loadExample} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}