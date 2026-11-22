"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useStore, formatTRY } from "@/components/StoreProvider";
import { ProductCard } from "@/components/ProductCard";

const FAQS = [
  {
    q: "Kargo ücretli mi? Şeffaf kargo seçeneği var mı?",
    a: "1250₺ ve üzeri tüm siparişlerinizde kargo tamamen ücretsizdir. Siparişleriniz DHL eCommerce ve Yurtiçi Kargo güvencesiyle özel korumalı kutusunda gönderilir.",
  },
  {
    q: "Ürünlere isim baskısı yapıyor musunuz? Ücreti ne kadar?",
    a: "Evet! Tüm hakiki deri ürünlerimizde Lazer İsim Baskısı ücretsizdir. Özel kabartmalı / varaklı Sıcak Baskı (Gold veya Gümüş yaldız) ve Hazır Sembol/Logo baskısı +150 TL olarak ürün sayfasında seçilebilir.",
  },
  {
    q: "Hediye paketi seçeneğiniz var mı?",
    a: "Ürün sayfasında 'Birlikte indirimli almak ister misin?' alanından Standart Hediye Paketi (150 TL) veya mühürlü çantalı Premium Hediye Paketi (349.90 TL) ekleyebilirsiniz.",
  },
  {
    q: "Kapıda ödeme ve kredi kartına taksit seçeneğiniz var mı?",
    a: "Tüm kredi kartlarına 12 aya varan taksit, 3D Secure güvenli ödeme, Havale/EFT ve Kapıda Ödeme seçeneklerimiz mevcuttur.",
  },
  {
    q: "İsim baskılı ürünlerde iade veya değişim yapılıyor mu?",
    a: "Standart (baskısız) ürünlerde 14 gün koşulsuz iade ve değişim hakkınız mevcuttur. Kişiye özel isim/sıcak baskı yapılan ürünlerde üretim hatası haricinde cayma hakkı kapsamında iade yapılamamaktadır.",
  },
];

export default function HomePage() {
  const { store } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const publishedProducts = store.products.filter((p) => p.published);
  const featuredProducts = publishedProducts.filter((p) => p.featured);
  const homeCategories = store.categories.filter((c) => c.showOnHome);
  const publishedReviews = store.reviews.filter((r) => r.published);

  const activeReview =
    publishedReviews[reviewIdx % Math.max(1, publishedReviews.length)];

  const scrollProducts = (dir: -1 | 1) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 pb-8 sm:space-y-12">
      {/* 1. CLEAN EDITORIAL HERO — ZERO CLUTTER, IMAGE TAKES CENTER STAGE */}
      <section className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-8 sm:pt-5">
        <Link
          href="/urun/dors-hakiki-deri-el-cantasi"
          className="group relative block aspect-4/5 w-full overflow-hidden rounded-[24px] bg-[#0B162C] sm:aspect-21/9"
        >
          <img
            src={store.settings.heroImage}
            alt={store.settings.heroTitle}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Subtle bottom vignette only — keeps 85% of photo completely clear */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-10 sm:left-10 sm:right-10">
            <h1 className="text-2xl font-light tracking-wide text-white sm:text-4xl lg:text-5xl">
              {store.settings.heroTitle}
            </h1>
            <span className="hidden shrink-0 rounded-full bg-white/95 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 backdrop-blur-xs transition group-hover:bg-[#1974E5] group-hover:text-white sm:inline-flex">
              Keşfet →
            </span>
          </div>
        </Link>
      </section>

      {/* 2. EXACT GETTO DERI 2x2 / 4-COL CATEGORY CARDS (Clean image + ONLY thin centered title at bottom!) */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {homeCategories.slice(0, 4).map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="group relative aspect-square overflow-hidden rounded-[20px] bg-[#0B162C]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-4 px-3 text-center">
                <h2 className="text-xs font-normal uppercase tracking-[0.14em] text-white sm:text-base">
                  {cat.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. "YILBAŞI" HORIZONTAL PRODUCT CAROUSEL (Matches Screenshot 2 exactly!) */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-8">
        <div className="rounded-[28px] bg-white p-4 shadow-2xs sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-3xl">
              YILBAŞI
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollProducts(-1)}
                aria-label="Önceki ürünler"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-bold text-neutral-800 transition hover:bg-neutral-100"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollProducts(1)}
                aria-label="Sonraki ürünler"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-bold text-neutral-800 transition hover:bg-neutral-100"
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
          >
            {(featuredProducts.length > 0
              ? featuredProducts
              : publishedProducts
            ).map((product) => (
              <div
                key={product.id}
                className="w-[215px] shrink-0 snap-start sm:w-[270px] lg:w-[290px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FULL-BLEED AUTO-PLAY VIDEO BANNER (Minimalist, zero text clutter!) */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-8">
        <div className="relative overflow-hidden rounded-[24px] bg-black">
          <video
            src={store.settings.promoVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="h-[260px] w-full object-cover sm:h-[420px]"
          />
          <div className="absolute bottom-5 right-5">
            <Link
              href="/urun/dors-hakiki-deri-el-cantasi"
              className="inline-flex items-center rounded-full bg-white/90 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-md transition hover:bg-[#1974E5] hover:text-white"
            >
              Sıcak Baskı Tasarla →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EXACT GETTO DERI "Müşterilerimiz Ne Diyor?" PHOTO REVIEW CAROUSEL (Screenshots 3 & 4!) */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-8">
        <div className="rounded-[28px] bg-white px-4 py-10 shadow-2xs sm:px-10 sm:py-14">
          {/* Header with Emerald/Teal Judge.me Stars */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Müşterilerimiz Ne Diyor?
            </h2>
            <div className="mt-2.5 flex items-center justify-center gap-2 text-base font-medium text-neutral-900">
              <span className="tracking-wider text-[#008C76]">★★★★★</span>
              <span className="font-semibold">4.89</span>
              <span className="text-[#008C76]">★</span>
              <span className="text-neutral-600">(4.712)</span>
            </div>
          </div>

          {/* Photo Review Carousel with Left/Right Arrows */}
          {activeReview && (
            <div className="relative mx-auto mt-8 max-w-4xl">
              {/* Desktop: 3-card view, Mobile: 1 big photo card exactly like Screenshot 3 */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setReviewIdx(
                      (i) =>
                        (i - 1 + publishedReviews.length) %
                        publishedReviews.length
                    )
                  }
                  aria-label="Önceki yorum"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-neutral-700 transition hover:bg-neutral-100"
                >
                  ‹
                </button>

                <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
                  {[0, 1, 2].map((offset) => {
                    const rev =
                      publishedReviews[
                        (reviewIdx + offset) % publishedReviews.length
                      ];
                    if (!rev) return null;
                    return (
                      <div
                        key={`${rev.id}-${offset}`}
                        className={`overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs ${
                          offset > 0 ? "hidden sm:block" : "block"
                        }`}
                      >
                        <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                          <img
                            src={
                              rev.photoUrl ||
                              "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
                            }
                            alt={rev.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4 text-center">
                          <p className="line-clamp-2 text-sm font-medium text-neutral-900">
                            {rev.comment}
                          </p>
                          <div className="mt-2.5 text-lg tracking-widest text-[#008C76]">
                            {"★".repeat(rev.rating)}
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-neutral-400">
                            {rev.author} • {rev.productName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setReviewIdx((i) => (i + 1) % publishedReviews.length)
                  }
                  aria-label="Sonraki yorum"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-neutral-700 transition hover:bg-neutral-100"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. LOOKBOOK EDITORIAL STRIP (Minimalist text) */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-[24px] bg-white shadow-2xs lg:grid-cols-12">
          <div className="relative aspect-16/10 lg:col-span-7 lg:aspect-auto">
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=85"
              alt="Yeni Sezon"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl font-light tracking-wide sm:text-3xl">
                Derinin ardında başka bir dünya.
              </h2>
            </div>
          </div>

          <div className="flex flex-col justify-center divide-y divide-neutral-100 p-5 sm:p-8 lg:col-span-5">
            {publishedProducts.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id}
                href={`/urun/${item.slug}`}
                className="group flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-bold text-neutral-300">
                    0{idx + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-[#1974E5]">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-bold text-neutral-500">
                      {formatTRY(item.price)}
                    </p>
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F6F6] text-xs font-bold text-neutral-800 transition group-hover:bg-[#1974E5] group-hover:text-white">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="mx-auto max-w-3xl px-3 sm:px-8">
        <h2 className="text-center text-xl font-bold text-neutral-900 sm:text-2xl">
          Sıkça Sorulan Sorular
        </h2>
        <div className="mt-5 space-y-2.5">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold text-neutral-900 sm:text-sm"
                >
                  <span>{item.q}</span>
                  <span className="ml-3 text-base font-bold text-neutral-400">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-neutral-100 px-5 py-3.5 text-xs leading-relaxed text-neutral-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
