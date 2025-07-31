import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, Key } from 'lucide-react';
import Image from 'next/image';

interface PriceCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  description,
  features,
  isPopular
}) => {
  return (
    <div className="flex flex-col h-full">
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-t-sm text-center">
          限时特惠
        </div>
      )}
      <Card className={`flex flex-col h-full flex-1 ${isPopular ? 'border-primary shadow-md rounded-t-none' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-muted-foreground ml-1">元</span>
          </div>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 mr-2 text-primary mt-1 shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export function PriceCards() {
  return (
    <div className="space-y-8 px-4 md:px-0">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">选择您的套餐</h2>
        <p className="text-muted-foreground">根据您的需求选择最适合的方案</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <PriceCard
          title="免费版"
          price="0"
          description="无限制免费调用(高峰期不稳定)"
          features={[
            "基础AI对话功能",
            "高峰期可能不稳定"
          ]}
        />
        
        <PriceCard
          title="标准版"
          price="15"
          description="20天稳定享用(独立服务)"
          features={[
            "解锁字数限制",
            "稳定的API访问",
            "独立服务器资源",
            "提供个人专属请求密钥"
          ]}
        />
        
        <PriceCard
          title="年度版"
          price="30"
          description="一年稳定享用(独立服务)"
          features={[
            "解锁字数限制",
            "全年稳定API访问",
            "专属服务器资源",
            "提供个人专属请求密钥"
          ]}
          isPopular={true}
        />
      </div>
      
      <div className="mt-12 p-6 border border-border rounded-lg bg-muted/10 max-w-2xl mx-auto">
        <div className="flex flex-col items-center">
          <h3 className="font-medium text-lg mb-4 text-center">自助开通服务</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
            扫描下方二维码添加智能客服微信，自助购买套餐。赞赏时务必备注可联系的微信号或QQ，以便我们为您开通专属服务通道。
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <Image 
              src="https://tc.yjie.fun/uploads/02de8731b59011056a9763f19859551.jpg" 
              alt="客服二维码" 
              width={200} 
              height={200}
              className="mx-auto"
            />
            <p className="text-xs text-center mt-2 text-gray-500">扫码添加智能客服</p>
          </div>

          <div className="w-full max-w-md mb-6 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start">
              <Key className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-2">个人专属密钥说明</h4>
                <p className="text-sm text-muted-foreground">
                  开通付费版后，我们将提供独立的个人专属请求密钥，该密钥可用于API直接请求或在本站使用，确保您的服务稳定可靠且完全私密。
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <h4 className="font-medium text-sm mb-3 text-center">API 调用信息</h4>
            <div className="border border-border p-4 rounded-lg bg-muted/30 space-y-3">
              <div>
                <p className="text-xs font-medium mb-1">API 端点地址:</p>
                <code className="text-xs bg-background p-2 rounded block w-full overflow-auto">https://grokyellow.96ai.top/v1/chat/completions</code>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">密钥:</p>
                <code className="text-xs bg-background p-2 rounded block">sk-123456 (开通后获取个人专属密钥)</code>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">支持模型:</p>
                <ul className="text-xs space-y-1 pl-3">
                  <li>• 酒馆-Flash</li>
                  <li>• 酒馆-Flash-NoThinking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 