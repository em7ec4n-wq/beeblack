import React from "react";
import { INITIAL_STORE } from "@/data/initialStore";
import { CategoryClient } from "@/components/CategoryClient";

export function generateStaticParams() {
  return INITIAL_STORE.categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}
