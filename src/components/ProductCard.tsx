"use client";

import React from "react";
import Link from "next/link";
import type { Product } from "@/types/store";
import { formatTRY, useStore } from "@/components/StoreProvider";
import { SpecIcon } from "@/components/Icons";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();

  const discountPercent =
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVar = product.variants[0];
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        image: firstVar?.image || product.image,
        variantName: firstVar?.name || "STANDART",
        basePrice: product.price,
        quantity: 1,
        upsells: [],
      },
      true
    );
  };

  return (
    <div className="group flex flex-col">
      {/* 1. ROUNDED IMAGE CONTAINER (Exact Getto Deri Screenshot 2 style) */}
      <Link
        href={`/urun/${product.slug}`}
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-[#101B39]"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top badges: Left = Red Discount Pill, Right = Translucent Rating Pill */}
        <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between gap-1.5">
          {discountPercent > 0 ? (
            <span className="rounded-full bg-[#D60000] px-2.5 py-1 text-[11px] font-bold tracking-tight text-white shadow-xs">
              {discountPercent}% indirim!
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-bold text-neutral-900 backdrop-blur-md">
            <span className="text-amber-500">★</span>
            <span>{product.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* Bottom-right Blue Circular Bag Quick-Add Button (Exact match!) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label="Hızlı Sepete Ekle"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1974E5] text-white shadow-lg shadow-blue-600/30 transition-transform duration-200 hover:scale-110 hover:bg-[#1461c4]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 7h12l1 13H5L6 7z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </button>
      </Link>

      {/* 2. CENTERED TEXT INFO (Brand -> Title -> Price + Slanted Red Strikethrough) */}
      <div className="mt-3 flex flex-1 flex-col items-center text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
          {product.brand}
        </span>

        <Link
          href={`/urun/${product.slug}`}
          className="mt-1 line-clamp-2 px-1 text-sm font-semibold leading-snug text-neutral-900 transition-colors hover:text-[#1974E5]"
        >
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-bold text-neutral-900 sm:text-[15px]">
            {formatTRY(product.price)}
          </span>
          {product.compareAtPrice > product.price && (
            <span className="relative text-xs font-normal text-neutral-400">
              {formatTRY(product.compareAtPrice)}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-0.5 -right-0.5 top-1/2 h-[1.5px] -rotate-12 bg-[#D60000]"
              />
            </span>
          )}
        </div>

        {/* 3. BOTTOM SPEC BAR WITH CENTERED ICON + LABEL + VALUE (Exact match!) */}
        {product.specs.length > 0 && (
          <div className="mt-3 grid w-full grid-cols-2 divide-x divide-neutral-100 rounded-2xl border border-neutral-100 bg-white px-2 py-2.5 shadow-2xs">
            {product.specs.slice(0, 2).map((spec, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center px-1 text-center"
              >
                <SpecIcon
                  type={spec.icon}
                  className="h-4 w-4 text-neutral-700"
                />
                <span className="mt-1 text-[11px] font-medium text-neutral-800">
                  {spec.label}
                </span>
                <span className="text-[10px] font-semibold text-neutral-400">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
