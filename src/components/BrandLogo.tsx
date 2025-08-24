import React from 'react';

export default function BrandLogo() {
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl font-serif">知</span>
      </div>
      {/* Brand Name */}
      <div>
        <h1 className="text-3xl font-bold font-serif bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          知几
        </h1>
        <p className="text-xs text-gray-500 -mt-1">洞察先机 · 预见成败</p>
      </div>
    </div>
  );
}