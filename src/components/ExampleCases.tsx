'use client';

interface ExampleCase {
  name: string;
  score: number;
  zone: 'optimal' | 'easy' | 'challenge' | 'infeasible' | 'over-investment';
  description: string;
}

interface ExampleCasesProps {
  onLoadExample?: (example: ExampleCase) => void;
}

export default function ExampleCases({ onLoadExample }: ExampleCasesProps) {
  const exampleCases: ExampleCase[] = [
    {
      name: '客服对话系统',
      score: 92,
      zone: 'optimal',
      description: '基于大模型的智能客服，处理常见问题咨询'
    },
    {
      name: '代码审查助手',
      score: 88,
      zone: 'optimal',
      description: '自动审查代码质量，提供改进建议'
    },
    {
      name: '周报生成器',
      score: 95,
      zone: 'optimal',
      description: '根据工作记录自动生成周报'
    },
    {
      name: '创意设计工具',
      score: 65,
      zone: 'challenge',
      description: 'AI辅助创意设计和构思'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getZoneLabel = (zone: string) => {
    const labels: Record<string, string> = {
      optimal: '最大公约数',
      easy: '容易实现',
      challenge: '挑战区域',
      infeasible: '不可行',
      'over-investment': '过度投入'
    };
    return labels[zone] || zone;
  };

  const getZoneStyle = (zone: string) => {
    const styles: Record<string, string> = {
      optimal: 'bg-green-100 text-green-800',
      easy: 'bg-blue-100 text-blue-800',
      challenge: 'bg-yellow-100 text-yellow-800',
      infeasible: 'bg-red-100 text-red-800',
      'over-investment': 'bg-gray-100 text-gray-800'
    };
    return styles[zone] || 'bg-gray-100 text-gray-800';
  };

  const handleClick = (example: ExampleCase) => {
    if (onLoadExample) {
      onLoadExample(example);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h2 className="text-xl font-semibold mb-2">开始评估您的 AI Agent 项目</h2>
        <p className="text-gray-500">在左侧输入项目信息，获得专业的可行性分析</p>
      </div>
      
      {/* Example Cases Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {exampleCases.map((example) => (
          <div
            key={example.name}
            onClick={() => handleClick(example)}
            className="card-enhanced p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{example.name}</h3>
              <span className={`text-2xl font-bold ${getScoreColor(example.score)}`}>
                {example.score}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{example.description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getZoneStyle(example.zone)}`}>
                {getZoneLabel(example.zone)}
              </span>
              <button className="text-xs text-purple-600 hover:text-purple-700 hover:underline font-medium">
                查看详情 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}