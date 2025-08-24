'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: number;
  type: 'evaluating' | 'completed';
  user: string;
  project: string;
  score?: number;
  timestamp: Date;
}

export default function LiveActivityStream() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // 初始活动
    const initialActivities: Activity[] = [
      { id: 1, type: 'completed', user: '张三', project: '智能客服系统', score: 92, timestamp: new Date() },
      { id: 2, type: 'evaluating', user: '李四', project: '代码生成器', timestamp: new Date() },
    ];
    setActivities(initialActivities);

    // 模拟实时活动
    const users = ['张三', '李四', '王五', '赵六', '钱七'];
    const projects = ['智能写作助手', '数据分析平台', '自动化测试工具', '内容审核系统', '智能推荐引擎'];
    
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now(),
        type: Math.random() > 0.3 ? 'evaluating' : 'completed',
        user: users[Math.floor(Math.random() * users.length)],
        project: projects[Math.floor(Math.random() * projects.length)],
        score: Math.random() > 0.3 ? Math.floor(Math.random() * 30) + 70 : undefined,
        timestamp: new Date()
      };

      setActivities(prev => {
        const updated = [newActivity, ...prev];
        return updated.slice(0, 5); // 只保留最新的5条
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score?: number) => {
    if (!score) return '';
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card-enhanced p-6 bg-gradient-to-br from-gray-50 to-white">
      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
        <span className="relative flex h-4 w-4 mr-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
        实时评估动态
      </h3>
      
      <div className="space-y-3 text-sm">
        {activities.map((activity) => (
          <div key={activity.id} className="animate-slide-in">
            {activity.type === 'evaluating' ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">@{activity.user}</span>
                <span className="text-gray-400">正在评估</span>
                <span className="font-medium">&ldquo;{activity.project}&rdquo;</span>
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">@{activity.user}</span>
                <span className="text-gray-400">完成了</span>
                <span className="font-medium">&ldquo;{activity.project}&rdquo;</span>
                {activity.score && (
                  <span className={`font-bold ${getScoreColor(activity.score)}`}>
                    ({activity.score}分)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}