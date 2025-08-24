import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知几 - AI Agent 可行性评估平台",
  description: "让每个 AI 创新者都能洞察先机，预见成败",
  keywords: "AI Agent, 可行性评估, LLM, 人工智能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
