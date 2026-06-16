'use client';

import ProductChecker from '@/components/ProductChecker';

export default function AmazonCheckerPage() {
  return (
    <ProductChecker
      store="Amazon"
      title="Amazon Price Checker"
      description="Paste an Amazon product link to fetch its current title, image and price."
      placeholder="https://www.amazon.in/dp/XXXXXXXXXX"
    />
  );
}
