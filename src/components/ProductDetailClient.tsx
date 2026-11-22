"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatTRY } from "@/components/StoreProvider";
import { SpecIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";

const FONTS = [
  { id: "cinzel", label: "Klasik", sample: "Abc", className: "font-serif tracking-wide" },
  { id: "montserrat", label: "Modern", sample: "Abc", className: "font-sans font-bold" },
  { id: "vibes", label: "El Yazısı", sample: "Abc", className: "font-serif italic" },
  { id: "mono", label: "Minimal", sample: "ABC", className: "font-mono tracking-widest" },
];

const FOIL_COLORS = [
  { id: "gold", label: "Altın (Gold)", dot: "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700" },
  { id: "silver", label: "Gümüş", dot: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500" },
  { id: "blind", label: "Kör Baskı", dot: "bg-neutral-800" },
];

export function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { store, updateStore, addToCart } = useStore();

  const product = useMemo(
    () =>
      store.products.find((p) => p.slug === slug) || store.products[0],
    [store.products, slug]
  );

  // Gallery state
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Personalization state (BASKI TÜRÜNÜZÜ SEÇİNİZ)
  const [stampType, setStampType] = useState<"none" | "laser" | "hot_stamp">(
    "none"
  );
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONTS[0].label);
  const [selectedFoil, setSelectedFoil] = useState(FOIL_COLORS[0].label);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>("");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const [openUpsellDropdown, setOpenUpsellDropdown] = useState<string | null>(null);

  // Upsells ("Birlikte indirimli almak ister misin?")
  const [selectedUpsellIds, setSelectedUpsellIds] = useState<string[]>([]);
  const [upsellVariants, setUpsellVariants] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      store.upsells.forEach((u) => {
        if (u.defaultVariant) map[u.id] = u.defaultVariant;
      });
      return map;
    }
  );

  // Quantity & Accordions
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);

  // Customer Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revStamp, setRevStamp] = useState("Sıcak Baskı (Gold)");
  const [revSubmitted, setRevSubmitted] = useState(false);

  // Ask a Question Form
  const [qName, setQName] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qText, setQText] = useState("");
  const [qSubmitted, setQSubmitted] = useState(false);

  if (!product) return null;

  const activeVariant =
    product.variants[selectedVariantIdx] ||
    product.variants[0] || {
      id: "default",
      name: "STANDART",
      colorHex: "#171717",
      image: product.image,
      stock: 10,
    };

  const galleryImages = useMemo(() => {
    const imgs = [
      activeVariant.image,
      ...product.gallery.filter((g) => g !== activeVariant.image),
    ];
    return imgs.length > 0 ? imgs : [product.image];
  }, [activeVariant.image, product.gallery, product.image]);

  const activeUpsells = store.upsells.filter((u) => u.active);
  const selectedSymbol = store.symbols.find((s) => s.id === selectedSymbolId);

  // Dynamic Price Calculation (Base + Sıcak Baskı + Sembol + Seçili Hediye Paketi/Upsell)
  const hotStampFee =
    stampType === "hot_stamp"
      ? product.hotStampPrice || store.settings.defaultHotStampPrice
      : 0;
  const symbolFee = selectedSymbol ? selectedSymbol.price : 0;
  const upsellsFee = selectedUpsellIds.reduce((sum, id) => {
    const found = activeUpsells.find((u) => u.id === id);
    return sum + (found ? found.price : 0);
  }, 0);

  const singleUnitTotal =
    product.price + hotStampFee + symbolFee + upsellsFee;
  const finalTotalPrice = singleUnitTotal * quantity;

  const toggleUpsell = (id: string) => {
    setSelectedUpsellIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const buildCartPayload = () => {
    const chosenUpsells = selectedUpsellIds
      .map((id) => {
        const u = activeUpsells.find((x) => x.id === id);
        if (!u) return null;
        return {
          id: u.id,
          name: u.name,
          variant: upsellVariants[u.id],
          price: u.price,
          image: u.image,
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      variant?: string;
      price: number;
      image: string;
    }[];

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      image: activeVariant.image || product.image,
      variantName: activeVariant.name,
      basePrice: product.price,
      quantity,
      personalization:
        stampType === "none" && !selectedSymbol
          ? undefined
          : {
              type: stampType === "none" ? "laser" : stampType,
              typeLabel:
                stampType === "hot_stamp"
                  ? `Sıcak Baskı (+₺${(
                      product.hotStampPrice ||
                      store.settings.defaultHotStampPrice
                    ).toFixed(2)})`
                  : "Lazer Baskı (Ücretsiz)",
              price: hotStampFee,
              customText: customText.trim(),
              fontFamily: selectedFont,
              foilColor: stampType === "hot_stamp" ? selectedFoil : undefined,
              symbolName: selectedSymbol?.name,
              symbolPrice: selectedSymbol?.price,
            },
      upsells: chosenUpsells,
    };
  };

  const handleAddToCart = () => {
    addToCart(buildCartPayload(), true);
  };

  const handleBuyNow = () => {
    addToCart(buildCartPayload(), false);
    router.push("/odeme");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;
    const next = structuredClone(store);
    next.reviews.unshift({
      id: `rev-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      author: revName.trim(),
      rating: revRating,
      comment: revComment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
      stampChoice: revStamp,
      published: true,
    });
    updateStore(next);
    setRevName("");
    setRevComment("");
    setRevSubmitted(true);
    setShowReviewForm(false);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qName.trim() || !qText.trim()) return;
    const next = structuredClone(store);
    next.questions.unshift({
      id: `q-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      customerName: qName.trim(),
      customerPhone: qPhone.trim() || "Belirtilmedi",
      question: qText.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "unanswered",
      isPublic: true,
    });
    updateStore(next);
    setQName("");
    setQPhone("");
    setQText("");
    setQSubmitted(true);
  };

  const productReviews = store.reviews.filter(
    (r) => r.published && r.productId === product.id
  );
  const allReviews =
    productReviews.length > 0
      ? productReviews
      : store.reviews.filter((r) => r.published);

  const productQuestions = store.questions.filter(
    (q) => q.productId === product.id && q.isPublic
  );

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link
          href={`/kategori/${product.categorySlug}`}
          className="hover:text-neutral-900"
        >
          Koleksiyon
        </Link>
        <span>/</span>
        <span className="font-semibold text-neutral-900">{product.name}</span>
      </nav>

      {/* MAIN PRODUCT 2-COLUMN GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ===================================================== */}
        {/* LEFT COLUMN: IMAGE GALLERY + PRODUCT VIDEO SUPPORT     */}
        {/* ===================================================== */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-3">
            {/* Main Media Container */}
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xs">
              {showVideo && product.videoUrl ? (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={galleryImages[activeMediaIdx] || product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Live Personalization Preview Overlay on Product Image */}
              {(customText.trim() || selectedSymbol) && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-amber-400/50 bg-black/80 px-4 py-3 text-white backdrop-blur-md">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                      CANLI BASKI ÖNİZLEMESİ (
                      {stampType === "hot_stamp" ? "SICAK BASKI" : "LAZER BASKI"}
                      )
                    </span>
                    <p
                      className={`mt-0.5 text-lg font-bold tracking-wider ${
                        stampType === "hot_stamp" &&
                        selectedFoil.includes("Gold")
                          ? "text-amber-300"
                          : stampType === "hot_stamp" &&
                              selectedFoil.includes("Gümüş")
                            ? "text-slate-200"
                            : "text-stone-200"
                      }`}
                    >
                      {selectedSymbol ? `${selectedSymbol.iconText} ` : ""}
                      {customText.trim() || selectedSymbol?.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                    {selectedFont.split(" ")[0]}
                  </span>
                </div>
              )}

              {/* Video Toggle Button */}
              {product.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-xs transition hover:bg-black"
                >
                  <span>{showVideo ? "📷 Fotoğraflara Dön" : "▶ Ürün Videosunu İzle"}</span>
                </button>
              )}
            </div>

            {/* Thumbnail Row (Photos + Video thumb) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShowVideo(false);
                    setActiveMediaIdx(idx);
                  }}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    !showVideo && activeMediaIdx === idx
                      ? "border-neutral-900 shadow-xs"
                      : "border-neutral-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}

              {product.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className={`relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 bg-neutral-900 text-white transition ${
                    showVideo
                      ? "border-[#1974E5]"
                      : "border-neutral-800 opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="text-lg">▶</span>
                  <span className="mt-0.5 text-[10px] font-bold">VİDEO</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* RIGHT COLUMN: COMPACT, MODERN GETTO DERI BUY BOX      */}
        {/* ===================================================== */}
        <div className="space-y-4 lg:col-span-5">
          {/* 1. TITLE, PRICE, RED STRIKETHROUGH & STAR RATING */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-[26px]">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-neutral-900">
                  {formatTRY(product.price)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-sm font-semibold text-neutral-400 line-through decoration-[#D60000] decoration-2">
                    {formatTRY(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <a
                href="#degerlendirmeler"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-bold text-neutral-900 shadow-2xs transition hover:border-neutral-300"
              >
                <span className="text-amber-500">★</span>
                <span>{product.rating.toFixed(2)}</span>
              </a>
            </div>
          </div>

          {/* 2. COLOR VARIANTS WITH COMPACT THUMBNAIL BOXES */}
          {product.variants.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-600">
                Renk:{" "}
                <strong className="font-bold uppercase text-neutral-900">
                  {activeVariant.name}
                </strong>
              </p>

              <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-9 lg:grid-cols-6">
                {product.variants.map((variant, idx) => {
                  const selected = idx === selectedVariantIdx;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setActiveMediaIdx(0);
                        setShowVideo(false);
                      }}
                      title={variant.name}
                      className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-white p-0.5 transition ${
                        selected
                          ? "border-neutral-900 ring-1 ring-neutral-900/20"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <img
                        src={variant.image}
                        alt={variant.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PERSONALIZATION MODULE (MODERN PILLS — NO NATIVE SELECTS!) */}
          {product.personalizationEnabled && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#B91C1C]">
                  BASKI TÜRÜNÜZÜ SEÇİNİZ <span className="text-[#D60000]">*</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  <span>Kurallar & Örnekler</span>
                  <span>›</span>
                </button>
              </div>

              {/* Lazer Baskı vs Sıcak Baskı Modern Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setStampType((prev) =>
                      prev === "laser" ? "none" : "laser"
                    )
                  }
                  className={`flex items-center gap-2.5 rounded-2xl border-2 bg-white px-3.5 py-2.5 text-left transition-all ${
                    stampType === "laser"
                      ? "border-[#1974E5] bg-blue-50/40 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      stampType === "laser"
                        ? "bg-[#1974E5] text-white"
                        : "border border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {stampType === "laser" ? "✓" : "+"}
                  </span>
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-neutral-900 sm:text-sm">
                      Lazer Baskı
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-600">
                      Ücretsiz
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStampType((prev) =>
                      prev === "hot_stamp" ? "none" : "hot_stamp"
                    )
                  }
                  className={`flex items-center gap-2.5 rounded-2xl border-2 bg-white px-3.5 py-2.5 text-left transition-all ${
                    stampType === "hot_stamp"
                      ? "border-[#1974E5] bg-blue-50/40 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      stampType === "hot_stamp"
                        ? "bg-[#1974E5] text-white"
                        : "border border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {stampType === "hot_stamp" ? "✓" : "✒"}
                  </span>
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-neutral-900 sm:text-sm">
                      Sıcak Baskı
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-600">
                      +₺
                      {(
                        product.hotStampPrice ||
                        store.settings.defaultHotStampPrice
                      ).toFixed(2)}
                    </span>
                  </div>
                </button>
              </div>

              {/* Compact Modern Personalization Box (Zero native selects!) */}
              {stampType !== "none" && (
                <div className="space-y-3 rounded-2xl border border-[#1974E5]/30 bg-white p-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1974E5]">
                      {stampType === "hot_stamp"
                        ? "Sıcak Baskı Detayı"
                        : "Lazer Baskı Detayı"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStampType("none");
                        setCustomText("");
                        setSelectedSymbolId("");
                      }}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-rose-600"
                    >
                      İptal Et ✕
                    </button>
                  </div>

                  {/* Custom Name Input */}
                  <input
                    type="text"
                    maxLength={18}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Yazılacak İsim / Baş Harfler (Örn: A. YILMAZ)"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-[#F6F6F6] px-3.5 text-sm font-semibold text-neutral-900 transition focus:border-[#1974E5] focus:bg-white focus:outline-none"
                  />

                  {/* Modern Font Chip Selector (Replaces ugly OS dropdown!) */}
                  <div>
                    <span className="block text-[11px] font-bold text-neutral-500">
                      Yazı Tipi
                    </span>
                    <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                      {FONTS.map((f) => {
                        const active = selectedFont === f.label;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFont(f.label)}
                            className={`flex flex-col items-center justify-center rounded-xl border py-1.5 transition ${
                              active
                                ? "border-[#1974E5] bg-[#1974E5] text-white shadow-2xs"
                                : "border-neutral-200 bg-[#F9F9F9] text-neutral-800 hover:border-neutral-300"
                            }`}
                          >
                            <span className={`text-sm ${f.className}`}>
                              {f.sample}
                            </span>
                            <span className="text-[10px] font-semibold">
                              {f.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modern Foil Color Pills (Only for Sıcak Baskı) */}
                  {stampType === "hot_stamp" && (
                    <div>
                      <span className="block text-[11px] font-bold text-neutral-500">
                        Varak Rengi
                      </span>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                        {FOIL_COLORS.map((fc) => {
                          const active = selectedFoil === fc.label;
                          return (
                            <button
                              key={fc.id}
                              type="button"
                              onClick={() => setSelectedFoil(fc.label)}
                              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-bold transition ${
                                active
                                  ? "border-[#1974E5] bg-blue-50 text-[#1974E5]"
                                  : "border-neutral-200 bg-[#F9F9F9] text-neutral-700 hover:border-neutral-300"
                              }`}
                            >
                              <span
                                className={`h-3 w-3 shrink-0 rounded-full border border-black/15 ${fc.dot}`}
                              />
                              <span className="truncate">{fc.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Compact Ready Logo Trigger */}
                  <div className="flex items-center justify-between rounded-xl bg-[#F6F6F6] px-3 py-2">
                    <div className="text-[11px]">
                      <span className="font-bold text-neutral-800">
                        {selectedSymbol
                          ? `${selectedSymbol.iconText} ${selectedSymbol.name} (+₺${selectedSymbol.price})`
                          : "Hazır Logo / Sembol (+₺150)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedSymbol && (
                        <button
                          type="button"
                          onClick={() => setSelectedSymbolId("")}
                          className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700"
                        >
                          Sil
                        </button>
                      )}
                      <button
                        type="button"
                      onClick={() => setShowSymbolsModal(true)}
                      className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-neutral-700"
                    >
                      {selectedSymbol ? "Değiştir" : "Logo Seç"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PRIMARY ACTION ROW — ABOVE THE FOLD */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5">
              {/* Compact Quantity Pill */}
              <div className="inline-flex h-13 shrink-0 items-center gap-3.5 rounded-full border border-neutral-300 bg-white px-4 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-base font-bold text-neutral-600 transition hover:text-black"
                >
                  −
                </button>
                <span className="min-w-4 text-center text-sm font-extrabold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-base font-bold text-neutral-600 transition hover:text-black"
                >
                  +
                </button>
              </div>

              {/* Modern Gradient/Elevated SEPETE EKLE Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1974E5] to-[#0E5EC2] px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 active:translate-y-0 sm:text-sm"
              >
                <span>SEPETE EKLE</span>
                <span className="opacity-60">•</span>
                <span>{formatTRY(finalTotalPrice)}</span>
              </button>
            </div>

            {/* HEMEN AL Modern Secondary Pill Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex h-12 w-full items-center justify-center rounded-full border-2 border-[#1974E5] bg-white px-6 text-xs font-extrabold uppercase tracking-wider text-[#1974E5] transition-all hover:bg-[#1974E5]/5 sm:text-sm"
            >
              HEMEN AL
            </button>
          </div>

          {/* 5. COMPACT UPSELL / GIFT PACKAGE MODULE ("Birlikte indirimli almak ister misin?") */}
          <div className="space-y-2 pt-1">
            <h2 className="text-center text-sm font-extrabold text-[#D60000]">
              Birlikte indirimli almak ister misin?
            </h2>

            <div className="grid grid-cols-1 gap-2">
              {activeUpsells.map((item) => {
                const checked = selectedUpsellIds.includes(item.id);
                const dropdownOpen = openUpsellDropdown === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleUpsell(item.id)}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 transition-all ${
                      checked
                        ? "border-[#1974E5] bg-blue-50/30 shadow-xs"
                        : "border-neutral-200/90 hover:border-neutral-300"
                    }`}
                  >
                    {/* Custom Modern Checkbox */}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition ${
                        checked
                          ? "border-[#1974E5] bg-[#1974E5] text-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </span>

                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-11 w-11 shrink-0 rounded-xl border border-neutral-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-neutral-900 sm:text-sm">
                        {item.name}
                      </p>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span
                          className={
                            item.compareAtPrice
                              ? "text-[#D60000]"
                              : "text-neutral-800"
                          }
                        >
                          {formatTRY(item.price)}
                        </span>
                        {item.compareAtPrice && (
                          <span className="text-[11px] font-medium text-neutral-400 line-through">
                            {formatTRY(item.compareAtPrice)}
                          </span>
                        )}

                        {/* Custom Pill Variant Picker (replaces native select!) */}
                        {item.variants && item.variants.length > 0 && (
                          <div
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenUpsellDropdown(
                                  dropdownOpen ? null : item.id
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-[#D60000] transition hover:bg-rose-100"
                            >
                              <span>
                                {upsellVariants[item.id] || item.variants[0]}
                              </span>
                              <span>▾</span>
                            </button>

                            {dropdownOpen && (
                              <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
                                {item.variants.map((v) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      setUpsellVariants((prev) => ({
                                        ...prev,
                                        [item.id]: v,
                                      }));
                                      setOpenUpsellDropdown(null);
                                    }}
                                    className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                                      (upsellVariants[item.id] ||
                                        item.variants?.[0]) === v
                                        ? "bg-[#1974E5] text-white"
                                        : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. ÜRÜN ÖZELLİKLERİ (Dimension & Feature Icon Cards) */}
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
              ÜRÜN ÖZELLİKLERİ
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {product.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center rounded-xl bg-[#F6F6F6] p-3 text-center"
                >
                  <SpecIcon
                    type={spec.icon}
                    className="h-5 w-5 text-neutral-800"
                  />
                  <span className="mt-1.5 text-[11px] font-bold text-neutral-900">
                    {spec.label}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium text-neutral-500">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. ÜRÜN AÇIKLAMASI ACCORDION + DELIVERY ESTIMATE BOX */}
          <div className="space-y-2.5">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setDescOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-xs font-bold text-neutral-900 sm:text-sm"
              >
                <span>Ürün Açıklaması</span>
                <span className="text-base font-bold">
                  {descOpen ? "−" : "+"}
                </span>
              </button>
              {descOpen && (
                <div className="border-t border-neutral-100 px-4 py-3.5 text-xs leading-relaxed text-neutral-600">
                  {product.description}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setMaterialOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-xs font-bold text-neutral-900 sm:text-sm"
              >
                <span>%100 Hakiki Deri & Bakım Bilgisi</span>
                <span className="text-base font-bold">
                  {materialOpen ? "−" : "+"}
                </span>
              </button>
              {materialOpen && (
                <div className="border-t border-neutral-100 px-4 py-3.5 text-xs leading-relaxed text-neutral-600">
                  {product.materialNote}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-800">
              <span className="text-base">🚚</span>
              <span>{product.deliveryEstimate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY MOBILE / SCROLL BOTTOM BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/90 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-neutral-900">
              {product.name}
            </p>
            <p className="text-sm font-extrabold text-[#1974E5]">
              {formatTRY(finalTotalPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="ml-auto shrink-0 rounded-full bg-gradient-to-r from-[#1974E5] to-[#0E5EC2] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md"
          >
            SEPETE EKLE
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* CUSTOMER REVIEWS SECTION (With Star Options & Photos) */}
      {/* ===================================================== */}
      <section
        id="degerlendirmeler"
        className="mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
              Müşteri Değerlendirmeleri
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg text-amber-500">★★★★★</span>
              <span className="text-sm font-bold text-neutral-900">
                {product.rating.toFixed(2)} / 5.0
              </span>
              <span className="text-xs text-neutral-500">
                ({allReviews.length} doğrulanmış değerlendirme)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm((v) => !v)}
            className="rounded-full bg-[#1974E5] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#1461c4]"
          >
            {showReviewForm ? "Formu Kapat" : "★ Değerlendirme Yazın"}
          </button>
        </div>

        {/* AI Summary Card like Getto Deri Judge.me widget */}
        <div className="mt-6 rounded-2xl bg-[#F6F6F6] p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Son müşteri yorumlarından özetlendi
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-700 sm:text-sm">
            Müşteriler bu hakiki deri ürünü kalitesi, sıcak baskı isim
            işçiliği, yumuşak deri dokusu ve pürüzsüz fermuarları nedeniyle
            övdü. Hediye paketi seçeneğinin özenli olduğu vurgulandı.
          </p>
        </div>

        {revSubmitted && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
            ✓ Değerlendirmeniz başarıyla eklendi! Teşekkür ederiz.
          </div>
        )}

        {/* Write a Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-[#1974E5]/30 bg-blue-50/30 p-5"
          >
            <h3 className="text-base font-bold text-neutral-900">
              Ürünü Değerlendirin
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800">
                  Adınız Soyadınız *
                </label>
                <input
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Örn: Kemal K."
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800">
                  Yıldız Puanınız *
                </label>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className={`h-10 flex-1 rounded-xl border text-sm font-bold ${
                        revRating >= star
                          ? "border-amber-400 bg-amber-50 text-amber-600"
                          : "border-neutral-200 bg-white text-neutral-400"
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800">
                  Baskı Tercihiniz
                </label>
                <select
                  value={revStamp}
                  onChange={(e) => setRevStamp(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                >
                  <option value="Sıcak Baskı (Gold)">Sıcak Baskı (Gold)</option>
                  <option value="Sıcak Baskı (Gümüş)">
                    Sıcak Baskı (Gümüş)
                  </option>
                  <option value="Lazer Baskı">Lazer Baskı</option>
                  <option value="Baskısız">Baskısız</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800">
                Yorumunuz *
              </label>
              <textarea
                required
                rows={3}
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder="Ürün kalitesi, boyutu, sıcak baskı ve hediye paketi hakkındaki deneyiminizi paylaşın…"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-[#1974E5] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Yorumu Gönder
            </button>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="mt-6 divide-y divide-neutral-100">
          {allReviews.map((rev) => (
            <div key={rev.id} className="py-5 first:pt-2 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-500">
                    {"★".repeat(rev.rating)}
                  </span>
                  <span className="text-sm font-bold text-neutral-900">
                    {rev.author}
                  </span>
                  {rev.verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      ✓ Doğrulanmış
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400">
                  Türkiye • {rev.date}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {rev.comment}
              </p>

              {rev.stampChoice && (
                <span className="mt-2 inline-block rounded-lg bg-[#F6F6F6] px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                  Baskı: {rev.stampChoice}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================== */}
      {/* CUSTOMER QUESTIONS SECTION ("Müşteri Soruları")       */}
      {/* ===================================================== */}
      <section
        id="soru-sor"
        className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs sm:p-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-xl font-extrabold text-neutral-900">
              Satıcıya Soru Sor
            </h2>
            <p className="mt-1 text-xs text-neutral-600">
              Ürün boyutu, sıcak baskı uygulaması veya kargo süreci hakkında
              merak ettiklerinizi sorun; ekibimiz en kısa sürede yanıtlasın.
            </p>

            {qSubmitted && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                ✓ Sorunuz başarıyla iletildi! En kısa sürede yanıtlanacaktır.
              </div>
            )}

            <form onSubmit={handleQuestionSubmit} className="mt-4 space-y-3">
              <input
                required
                value={qName}
                onChange={(e) => setQName(e.target.value)}
                placeholder="Adınız Soyadınız *"
                className="h-10 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
              />
              <input
                value={qPhone}
                onChange={(e) => setQPhone(e.target.value)}
                placeholder="Telefon Numaranız (SMS bilgilendirme için)"
                className="h-10 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
              />
              <textarea
                required
                rows={3}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Bu ürünle ilgili sorunuzu yazın…"
                className="w-full rounded-xl border border-neutral-300 p-3 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Soruyu Gönder
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-base font-bold text-neutral-900">
              Yanıtlanan Müşteri Soruları ({store.questions.length})
            </h3>
            <div className="mt-4 space-y-3">
              {(productQuestions.length > 0
                ? productQuestions
                : store.questions
              ).map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-bold text-neutral-800">
                      {q.customerName}
                    </span>
                    <span>{q.createdAt}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-neutral-900">
                    S: &ldquo;{q.question}&rdquo;
                  </p>
                  {q.answer ? (
                    <div className="mt-2.5 rounded-xl bg-white p-3 text-xs leading-relaxed text-neutral-700">
                      <span className="font-bold text-[#1974E5]">
                        Getto Deri Yanıtı:{" "}
                      </span>
                      {q.answer}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-amber-700">
                      Yetkili yanıtı bekleniyor…
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <section className="mt-14">
        <h2 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">
          Benzer Hakiki Deri Ürünler
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
          {store.products
            .filter((p) => p.published && p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      {/* ===================================================== */}
      {/* MODAL 1: İSİM BASKISI KURALLAR & ÖRNEKLER              */}
      {/* ===================================================== */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-neutral-900">
              İsim Baskısı: Kurallar & Örnekler
            </h3>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-neutral-700 sm:text-sm">
              <div className="rounded-2xl bg-[#F6F6F6] p-4">
                <p className="font-bold text-neutral-900">
                  1. Lazer Baskı (Ücretsiz) vs. Sıcak Baskı (+₺150.00)
                </p>
                <p className="mt-1">
                  • <strong>Lazer Baskı:</strong> Deri yüzeyine yakılarak
                  uygulanır, derinin kendi koyu tonunda kalıcı ve minimal bir
                  görünüm sunar.
                  <br />• <strong>Sıcak Baskı:</strong> Özel pirinç klişe ile
                  ısı ve pres altında deriye gömülerek uygulanır;{" "}
                  <strong>24K Gold (Altın)</strong>,{" "}
                  <strong>Gümüş Yaldız</strong> veya{" "}
                  <strong>Kör Gömme Baskı</strong> olarak seçilebilir.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F6F6] p-4">
                <p className="font-bold text-neutral-900">
                  2. Karakter Sınırı ve İade Bilgisi
                </p>
                <p className="mt-1">
                  • En estetik görünüm için <strong>Ad Soyad</strong> veya{" "}
                  <strong>Baş Harfler (Örn: A. YILMAZ)</strong> şeklinde
                  maksimum 18 karakter önerilir.
                  <br />• Kişiye özel isim/logo baskısı yapılan ürünlerde cayma
                  hakkı kapsamında iade/değişim yapılamamaktadır.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="mt-5 h-11 w-full rounded-full bg-[#1974E5] text-xs font-bold uppercase tracking-wider text-white"
            >
              Anladım, Seçime Dön
            </button>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL 2: HAZIR LOGOLAR (+₺150.00)                     */}
      {/* ===================================================== */}
      {showSymbolsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSymbolsModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-neutral-900">
              Hazır Logolar & Semboller
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              İsim baskınızın yanına veya tek başına uygulanacak hazır logoyu
              seçebilirsiniz.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {store.symbols.map((sym) => {
                const active = selectedSymbolId === sym.id;
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => {
                      setSelectedSymbolId(sym.id);
                      setShowSymbolsModal(false);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition ${
                      active
                        ? "border-[#1974E5] bg-blue-50"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <span className="text-2xl">{sym.iconText}</span>
                    <span className="mt-1.5 text-xs font-bold text-neutral-900">
                      {sym.name}
                    </span>
                    <span className="mt-0.5 text-[11px] font-bold text-emerald-600">
                      +₺{sym.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
