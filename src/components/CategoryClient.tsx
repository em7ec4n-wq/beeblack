"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { ProductCard } from "@/components/ProductCard";

const SORT_OPTIONS: {
  value: "featured" | "price_asc" | "price_desc";
  label: string;
}[] = [
  { value: "featured", label: "Öne Çıkanlar" },
  { value: "price_asc", label: "Fiyat: Artan" },
  { value: "price_desc", label: "Fiyat: Azalan" },
];

export function CategoryClient({ slug }: { slug: string }) {
  const { store } = useStore();
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">(
    "featured"
  );
  const [sortOpen, setSortOpen] = useState(false);

  const category =
    store.categories.find((c) => c.slug === slug) || store.categories[0];

  const categoryProducts = store.products.filter(
    (p) => p.published && p.categorySlug === slug
  );
  const displayProducts =
    categoryProducts.length > 0
      ? categoryProducts
      : store.products.filter((p) => p.published);

  const sortedProducts = [...displayProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return 0;
  });

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Öne Çıkanlar";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-8 sm:py-8">
      {/* 1. CLEAN, MINIMALIST EDITORIAL HEADER (No heavy dark photo banner!) */}
      <div className="mb-5">
        <nav className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-900">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span>Koleksiyonlar</span>
          <span>/</span>
          <span className="text-neutral-700">{category.name}</span>
        </nav>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-3xl">
              {category.name}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              {sortedProducts.length} ürün listeleniyor
            </p>
          </div>

          {/* Sleek Custom Sort Pill (No ugly native OS dropdown!) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-xs font-bold text-neutral-800 shadow-2xs transition hover:border-neutral-400"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3.5 w-3.5 text-neutral-500"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <span>{activeSortLabel}</span>
              <span className="text-[10px] text-neutral-400">▾</span>
            </button>

            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                        sortBy === opt.value
                          ? "bg-[#1974E5] text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. SLEEK SINGLE-ROW HORIZONTAL SUBCATEGORY STRIP (No stacked bulky box!) */}
      <div className="mb-7 -mx-4 border-y border-neutral-200/80 bg-white/70 px-4 py-3 backdrop-blur-xs sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {store.categories.map((cat) => {
            const active = cat.slug === slug;
            return (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                  active
                    ? "bg-[#171717] text-white shadow-xs"
                    : "bg-white text-neutral-600 ring-1 ring-neutral-200/90 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-5 w-5 rounded-full object-cover"
                />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. PRODUCT GRID */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
