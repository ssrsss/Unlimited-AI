import { Metadata } from 'next';
import { PriceCards } from '@/components/pricing/price-cards';

export const metadata: Metadata = {
  title: '价格套餐 | Unlimited AI',
  description: '选择最适合您需求的AI服务套餐',
};

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 md:py-12">
      <div className="container max-w-5xl">
        <PriceCards />
      </div>
    </div>
  );
} 