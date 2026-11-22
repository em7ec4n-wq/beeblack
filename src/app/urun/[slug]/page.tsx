import React from "react";
import { INITIAL_STORE } from "@/data/initialStore";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return INITIAL_STORE.products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
