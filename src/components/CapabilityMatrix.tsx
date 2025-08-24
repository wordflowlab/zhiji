'use client';

import { useEffect, useState } from 'react';

interface CapabilityMatrixProps {
  score?: number;
  position?: { x: number; y: number };
}

export default function CapabilityMatrix({ score, position }: CapabilityMatrixProps) {
  const [showMarker, setShowMarker] = useState(false);
  
  // 根据分数计算位置
  const calculatePosition = (score: number) => {
    // 分数越高，位置越靠右上
    const x = Math.min(90, Math.max(10, (score / 100) * 80 + 10));
    const y = Math.min(90, Math.max(10, 90 - (score / 100) * 80));
    return { x, y };
  };

  const markerPosition = position || (score ? calculatePosition(score) : { x: 50, y: 50 });

  useEffect(() => {
    if (score) {
      // 延迟显示标记点，创建动画效果
      setTimeout(() => setShowMarker(true), 500);
    }
  }, [score]);

  return (
    <div className="card-enhanced p-6 animate-slide-in" style={{animationDelay: '0.4s'}}>
      <h3 className="font-semibold mb-4 text-gray-800">能力矩阵定位</h3>
      
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-lg p-4" style={{ height: '400px' }}>
        {/* 坐标轴 */}
        <div className="absolute left-0 bottom-0 w-full h-full">
          {/* Y轴 - 商业价值 */}
          <div className="absolute left-8 top-4 bottom-8 w-px bg-gray-300"></div>
          <div className="absolute left-2 top-0 text-sm text-gray-600 font-medium">高</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-600 font-medium">商业价值</div>
          <div className="absolute left-2 bottom-4 text-sm text-gray-600 font-medium">低</div>
          
          {/* X轴 - 技术复杂度 */}
          <div className="absolute left-8 right-8 bottom-8 h-px bg-gray-300"></div>
          <div className="absolute left-8 bottom-2 text-sm text-gray-600 font-medium">低</div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-sm text-gray-600 font-medium">技术复杂度</div>
          <div className="absolute right-8 bottom-2 text-sm text-gray-600 font-medium">高</div>
        </div>

        {/* 区域标签 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 左上 - 容易实现 */}
          <div className="absolute left-12 top-12 w-1/3 h-1/3">
            <div className="bg-blue-50 rounded-lg h-full w-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">容易实现</span>
            </div>
          </div>
          
          {/* 右上 - 最大公约数 */}
          <div className="absolute right-12 top-12 w-1/3 h-1/3">
            <div className="bg-green-50 rounded-lg h-full w-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-green-600 font-medium text-sm">最大公约数</span>
            </div>
          </div>
          
          {/* 左下 - 不可行 */}
          <div className="absolute left-12 bottom-12 w-1/3 h-1/3">
            <div className="bg-red-50 rounded-lg h-full w-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-600 font-medium text-sm">不可行</span>
            </div>
          </div>
          
          {/* 右下 - 挑战区域 */}
          <div className="absolute right-12 bottom-12 w-1/3 h-1/3">
            <div className="bg-yellow-50 rounded-lg h-full w-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-yellow-600 font-medium text-sm">挑战区域</span>
            </div>
          </div>
          
          {/* 中间 - 过度投入 */}
          <div className="absolute left-1/3 top-1/3 w-1/3 h-1/3">
            <div className="bg-gray-50 rounded-lg h-full w-full opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm opacity-60">平衡区</span>
            </div>
          </div>
        </div>

        {/* 项目标记点 */}
        {showMarker && (
          <div 
            className="absolute animate-drop-in"
            style={{
              left: `${markerPosition.x}%`,
              top: `${markerPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-50"></div>
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                您的项目
              </div>
            </div>
          </div>
        )}

        {/* 网格线 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: '32px', top: '0', width: 'calc(100% - 64px)', height: 'calc(100% - 32px)' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          矩阵分析：根据项目的技术复杂度和商业价值，定位其在能力矩阵中的位置
        </p>
      </div>
    </div>
  );
}