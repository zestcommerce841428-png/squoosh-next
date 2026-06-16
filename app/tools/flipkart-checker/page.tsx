'use client';

import ProductChecker from '@/components/ProductChecker';

export default function FlipkartCheckerPage() {
  return (
    <ProductChecker
      store="Flipkart"
      title="Flipkart Price Checker"
      description="Paste a Flipkart product link to fetch its current title, image and price."
      placeholder="https://www.flipkart.com/.../p/itm..."
    />
  );
}
