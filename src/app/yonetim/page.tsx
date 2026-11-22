"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore, formatTRY } from "@/components/StoreProvider";
import type { Order, Product } from "@/types/store";
import { TridentLogo } from "@/components/Icons";

type AdminTab =
  | "dashboard"
  | "siparisler"
  | "urunler"
  | "baski_hediye"
  | "iadeler"
  | "sorular"
  | "yorumlar"
  | "odeme_ayar";

export default function AdminPanelPage() {
  const { store, updateStore, resetStore } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [toast, setToast] = useState("");

  // Modal states for printing Cargo Label & Invoice
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Order filter
  const [orderFilter, setOrderFilter] = useState<
    "all" | "preparing" | "shipped" | "delivered"
  >("all");

  // New Product Form
  const [showNewProd, setShowNewProd] = useState(false);
  const [pName, setPName] = useState("");
  const [pSku, setPSku] = useState("");
  const [pCat, setPCat] = useState("erkek-el-cantasi");
  const [pPrice, setPPrice] = useState("2399.99");
  const [pCompare, setPCompare] = useState("2999.90");
  const [pHotStampPrice, setPHotStampPrice] = useState("150");
  const [pHeight, setPHeight] = useState("11 CM");
  const [pWidth, setPWidth] = useState("18.5 CM");
  const [pCarry, setPCarry] = useState("Ergonomik El Tutma Yeri");
  const [pImage, setPImage] = useState(
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85"
  );
  const [pVideo, setPVideo] = useState(
    "https://cdn.shopify.com/videos/c/o/v/3a538497914a483fa5329751c56c96f9.mp4"
  );
  const [pDesc, setPDesc] = useState("");

  // Question answer draft
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  // New Review Form in Admin
  const [newRevAuthor, setNewRevAuthor] = useState("");
  const [newRevProdId, setNewRevProdId] = useState(
    store.products[0]?.id || "prod-dors-el-cantasi"
  );
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevComment, setNewRevComment] = useState("");
  const [newRevStamp, setNewRevStamp] = useState("Sıcak Baskı (Gold)");

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  // handle local photo upload to DataURL
  const handlePhotoFile = (
    files: FileList | null,
    onDone: (dataUrl: string) => void
  ) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onDone(reader.result);
        notify("✓ Görsel yüklendi");
      }
    };
    reader.readAsDataURL(files[0]);
  };

  // Live metrics
  const totalRevenue = store.orders.reduce((s, o) => s + o.total, 0);
  const shippedOrdersCount = store.orders.filter(
    (o) => o.status === "shipped"
  ).length;
  const preparingOrdersCount = store.orders.filter(
    (o) => o.status === "preparing"
  ).length;
  const unansweredCount = store.questions.filter(
    (q) => q.status === "unanswered"
  ).length;
  const pendingReturnsCount = store.returns.filter(
    (r) => r.status === "pending"
  ).length;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const slug = pName
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: pSku.trim() || `GTT-${Date.now().toString().slice(-4)}`,
      slug: `${slug}-${Date.now().toString().slice(-3)}`,
      name: pName.trim(),
      brand: "GETTO DERI",
      categorySlug: pCat,
      price: Number(pPrice) || 1999.9,
      compareAtPrice: Number(pCompare) || 2499.9,
      rating: 4.95,
      reviewCount: 12,
      image: pImage,
      gallery: [pImage],
      videoUrl: pVideo.trim() || undefined,
      variants: [
        {
          id: `v-${Date.now()}-1`,
          name: "LACİVERT",
          colorHex: "#243754",
          image: pImage,
          stock: 25,
        },
        {
          id: `v-${Date.now()}-2`,
          name: "SİYAH",
          colorHex: "#181818",
          image: pImage,
          stock: 30,
        },
      ],
      specs: [
        { icon: "height", label: "Yükseklik", value: pHeight || "11 CM" },
        { icon: "width", label: "Genişlik", value: pWidth || "18.5 CM" },
        { icon: "carry", label: "Taşıma", value: pCarry || "Ergonomik Tutma" },
      ],
      description:
        pDesc.trim() ||
        "%100 el yapımı hakiki deri, kişiye özel sıcak baskı ve lazer isim baskısına uygun özel tasarım.",
      materialNote:
        "Getto Deri ürünlerinde kullanılan malzeme %100 hakiki deridir.",
      deliveryEstimate:
        "Bugün sipariş verirseniz, 1-2 iş günü içerisinde kargoya teslim edilir.",
      personalizationEnabled: true,
      laserPrintFree: true,
      hotStampPrice: Number(pHotStampPrice) || 150,
      published: true,
      featured: true,
    };

    const next = structuredClone(store);
    next.products.unshift(newProd);
    updateStore(next);
    setShowNewProd(false);
    setPName("");
    notify(`✓ "${newProd.name}" vitrine eklendi!`);
  };

  const TABS: { key: AdminTab; label: string; badge?: string | number }[] = [
    { key: "dashboard", label: "📊 Canlı Performans" },
    {
      key: "siparisler",
      label: "📦 Sipariş & Kargo & Fatura",
      badge: store.orders.length,
    },
    {
      key: "urunler",
      label: "👜 Ürünler (Boyut & Video)",
      badge: store.products.length,
    },
    { key: "baski_hediye", label: "🔥 Sıcak Baskı & Hediye Paketi" },
    {
      key: "iadeler",
      label: "↩️ İadeler",
      badge: pendingReturnsCount || undefined,
    },
    {
      key: "sorular",
      label: "💬 Müşteri Soruları",
      badge: unansweredCount || undefined,
    },
    {
      key: "yorumlar",
      label: "⭐ Ürün Yorumları",
      badge: store.reviews.length,
    },
    { key: "odeme_ayar", label: "💳 Ödeme & Mağaza Ayarları" },
  ];

  const filteredOrders = store.orders.filter((o) =>
    orderFilter === "all" ? true : o.status === orderFilter
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-neutral-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-neutral-900 px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* TOP ADMIN HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#171717] px-4 py-3.5 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TridentLogo className="h-8 w-8 text-white" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wide sm:text-lg">
                  {store.settings.brandName} — İKAS / PRO YÖNETİM PANELİ
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Canlı
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Ürün Yükleme • Sıcak Baskı & Hediye Paketi Fiyatları • Kargo
                Etiketi • Faturalar • İadeler • Sorular • Yorumlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/urun/dors-hakiki-deri-el-cantasi"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
            >
              Örnek Ürün Sayfası ↗
            </Link>
            <Link
              href="/"
              className="rounded-full bg-[#1974E5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1461c4]"
            >
              Mağaza Vitrinine Dön ↗
            </Link>
          </div>
        </div>
      </header>

      {/* HORIZONTAL NAVIGATION TABS */}
      <div className="border-b border-neutral-200 bg-white px-4 py-2.5 shadow-2xs sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap gap-1.5">
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-[#1974E5] text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-white text-[#1974E5]"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8">
        {/* ===================================================== */}
        {/* TAB 1: CANLI PERFORMANS & DASHBOARD                   */}
        {/* ===================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Live KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">
                    TOPLAM CİRO (CANLI)
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    +%24.8
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-neutral-900">
                  {formatTRY(totalRevenue)}
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Sıcak baskı ve hediye paketi gelirleri dahil
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">
                    KARGODAKİ & HAZIRLANAN SİPARİŞLER
                  </span>
                  <span className="text-lg">🚚</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-[#1974E5]">
                  {shippedOrdersCount} Kargoda / {preparingOrdersCount} Baskıda
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("siparisler")}
                  className="mt-1 text-[11px] font-bold text-[#1974E5] underline"
                >
                  Kargo Etiketlerini Yazdır →
                </button>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">
                    ANLIK CANLI ZİYARETÇİ & DÖNÜŞÜM
                  </span>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-neutral-900">
                  48 Aktif Ziyaretçi
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Sepete Ekleme Oranı: %6.4 • Sıcak Baskı Tercihi: %78
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">
                    BEKLEYEN SORU & İADE TALEBİ
                  </span>
                  <span className="text-lg">💬</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-600">
                  {unansweredCount} Soru • {pendingReturnsCount} İade
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("sorular")}
                  className="mt-1 text-[11px] font-bold text-neutral-700 underline"
                >
                  Hemen Yanıtla →
                </button>
              </div>
            </div>

            {/* Quick Shortcut Grid matching Customer's WhatsApp checklist */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-extrabold text-neutral-900">
                Hızlı Mağaza Yönetim Modülleri
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                İhtiyacınız olan tüm operasyonları tek tıkla yönetebilirsiniz:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("urunler");
                    setShowNewProd(true);
                  }}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4 text-left transition hover:border-[#1974E5]"
                >
                  <span className="text-xl">📸</span>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-neutral-900">
                      Yeni Ürün & Video Yükle
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Fotoğraf, ürün videosu ve Yükseklik/Genişlik boyutları
                      ekleyin
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("baski_hediye")}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4 text-left transition hover:border-[#1974E5]"
                >
                  <span className="text-xl">🔥</span>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-neutral-900">
                      Sıcak Baskı & Hediye Paketi Fiyatları
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Sıcak baskı (+150 TL) ve Hediye Paketi fiyatlarını
                      belirleyin
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("siparisler")}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4 text-left transition hover:border-[#1974E5]"
                >
                  <span className="text-xl">🏷️</span>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-neutral-900">
                      Kargo Etiketi & Fatura Çıkart
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Kargodaki siparişleri görün, barkodlu kargo etiketi
                      yazdırın
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("yorumlar")}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4 text-left transition hover:border-[#1974E5]"
                >
                  <span className="text-xl">⭐</span>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-neutral-900">
                      Yıldızlı Ürün Yorumlarını Yönet
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      İstediğiniz gibi yorum ekleyin, düzenleyin veya gizleyin
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Orders Table with Direct Print Buttons */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-neutral-900">
                  Son Gelen Siparişler (Sıcak Baskı & Hediye Paketi Detaylı)
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("siparisler")}
                  className="text-xs font-bold text-[#1974E5] hover:underline"
                >
                  Tüm Siparişleri Gör →
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {store.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-neutral-900">
                          #{ord.orderNumber}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1974E5]">
                          {ord.status === "preparing"
                            ? "Atölyede / Baskıda"
                            : ord.status === "shipped"
                              ? "Kargoda"
                              : "Teslim Edildi"}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {ord.createdAt}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-neutral-800">
                        {ord.customerName} ({ord.city}/{ord.district}) •{" "}
                        {ord.customerPhone}
                      </p>
                      {ord.items.map((it) => (
                        <div
                          key={it.cartItemId}
                          className="mt-1 text-xs text-neutral-600"
                        >
                          • {it.name} ({it.variantName})
                          {it.personalization && (
                            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-900">
                              {it.personalization.typeLabel}: &ldquo;
                              {it.personalization.customText}&rdquo;
                            </span>
                          )}
                          {it.upsells.length > 0 && (
                            <span className="ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-900">
                              +{it.upsells.map((u) => u.name).join(", ")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-2 text-base font-extrabold text-neutral-900">
                        {formatTRY(ord.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLabelOrder(ord)}
                        className="rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-neutral-700"
                      >
                        🏷️ Kargo Etiketi Çıkart
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(ord)}
                        className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-100"
                      >
                        🧾 Fatura Görüntüle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 2: SİPARİŞLER, KARGODAKİLER, KARGO ETİKETİ & FATURA */}
        {/* ===================================================== */}
        {activeTab === "siparisler" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { k: "all", label: `Tümü (${store.orders.length})` },
                  {
                    k: "preparing",
                    label: `Atölye / Sıcak Baskıda (${preparingOrdersCount})`,
                  },
                  {
                    k: "shipped",
                    label: `Kargoda Olan Siparişler (${shippedOrdersCount})`,
                  },
                  {
                    k: "delivered",
                    label: "Teslim Edilenler",
                  },
                ].map((f) => (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() =>
                      setOrderFilter(
                        f.k as "all" | "preparing" | "shipped" | "delivered"
                      )
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
                      orderFilter === f.k
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((ord, idx) => (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-extrabold text-neutral-900">
                          Sipariş #{ord.orderNumber}
                        </span>
                        <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-neutral-700">
                          Fatura: {ord.invoiceNumber}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {ord.createdAt}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600">
                        <strong>Müşteri:</strong> {ord.customerName} •{" "}
                        {ord.customerPhone} • {ord.address}, {ord.district}/
                        {ord.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          const next = structuredClone(store);
                          const target = next.orders.find(
                            (x) => x.id === ord.id
                          );
                          if (target) {
                            target.status = e.target.value as Order["status"];
                            updateStore(next);
                            notify(
                              `✓ Sipariş #${ord.orderNumber} durumu güncellendi`
                            );
                          }
                        }}
                        className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                      >
                        <option value="preparing">
                          Atölyede / Sıcak Baskıda
                        </option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="returned">İade</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setLabelOrder(ord)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1974E5] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1461c4]"
                      >
                        🏷️ Kargo Etiketi Çıkart
                      </button>

                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(ord)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                      >
                        🧾 E-Arşiv Fatura
                      </button>
                    </div>
                  </div>

                  {/* Order Line Items with Personalization & Gift Wrap Details */}
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="space-y-2.5 lg:col-span-8">
                      {ord.items.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-[#FAFAFA] p-3.5"
                        >
                          <div className="flex gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                            <div>
                              <p className="text-sm font-bold text-neutral-900">
                                {item.name} ({item.variantName}) ×{" "}
                                {item.quantity}
                              </p>
                              {item.personalization && (
                                <p className="mt-1 text-xs font-bold text-[#1974E5]">
                                  🔥 {item.personalization.typeLabel} → İsim:
                                  &ldquo;{item.personalization.customText}&rdquo;
                                  ({item.personalization.fontFamily}
                                  {item.personalization.foilColor
                                    ? ` / ${item.personalization.foilColor}`
                                    : ""}
                                  )
                                  {item.personalization.symbolName
                                    ? ` + Sembol: ${item.personalization.symbolName}`
                                    : ""}
                                </p>
                              )}
                              {item.upsells.length > 0 && (
                                <p className="mt-1 text-xs font-bold text-amber-800">
                                  🎁 Hediye Paketi / Ek Ürün:{" "}
                                  {item.upsells
                                    .map(
                                      (u) =>
                                        `${u.name}${u.variant ? ` (${u.variant})` : ""} (+${formatTRY(u.price)})`
                                    )
                                    .join(" , ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl bg-neutral-50 p-4 text-xs lg:col-span-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Kargo Firması:</span>
                          <strong>{ord.cargoCompany}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Kargo Takip Kodu:</span>
                          <strong className="font-mono text-[#1974E5]">
                            {ord.trackingNumber}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Sıcak Baskı Ücreti:</span>
                          <strong>
                            {formatTRY(ord.personalizationTotal)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Hediye Paketi & Ek Ürün:</span>
                          <strong>{formatTRY(ord.upsellTotal)}</strong>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-neutral-200 pt-2 text-sm font-extrabold">
                        <span>Genel Toplam:</span>
                        <span className="text-[#1974E5]">
                          {formatTRY(ord.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 3: ÜRÜNLER (KOLAY YÜKLEME, VİDEO, BOYUTLAR)       */}
        {/* ===================================================== */}
        {activeTab === "urunler" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900">
                  Ürün Yönetimi (Fotoğraf, Video, Boyutlar ve Sıcak Baskı)
                </h2>
                <p className="text-xs text-neutral-500">
                  Her ürüne fotoğraf, tanıtım videosu (MP4), Yükseklik/Genişlik
                  boyut kutucukları ve sıcak baskı ücreti tanımlayabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProd((v) => !v)}
                className="rounded-xl bg-[#1974E5] px-5 py-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#1461c4]"
              >
                {showNewProd ? "✕ Formu Kapat" : "＋ Yeni Ürün & Video Ekle"}
              </button>
            </div>

            {showNewProd && (
              <form
                onSubmit={handleAddProduct}
                className="space-y-4 rounded-3xl border-2 border-[#1974E5] bg-white p-6 shadow-md"
              >
                <h3 className="text-base font-extrabold text-neutral-900">
                  Yeni Ürün Ekle (Kolay Ürün, Video & Boyut Yükleme)
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold">
                      Ürün Adı *
                    </label>
                    <input
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="Örn: Pars Minimal Hakiki Deri El Çantası"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold">Kategori</label>
                    <select
                      value={pCat}
                      onChange={(e) => setPCat(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                    >
                      {store.categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold">
                      İndirimli Satış Fiyatı (TL) *
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold">
                      Üstü Çizili Eski Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pCompare}
                      onChange={(e) => setPCompare(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                    />
                  </div>
                </div>

                {/* Product Dimensions & Sıcak Baskı Fee */}
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#F6F6F6] p-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800">
                      📏 Yükseklik (Ürün Boyutu)
                    </label>
                    <input
                      value={pHeight}
                      onChange={(e) => setPHeight(e.target.value)}
                      placeholder="Örn: 11 CM"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-800">
                      📐 Genişlik (Ürün Boyutu)
                    </label>
                    <input
                      value={pWidth}
                      onChange={(e) => setPWidth(e.target.value)}
                      placeholder="Örn: 18.5 CM"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-800">
                      👜 Taşıma / Bölme Özelliği
                    </label>
                    <input
                      value={pCarry}
                      onChange={(e) => setPCarry(e.target.value)}
                      placeholder="Örn: Ergonomik El Tutma Yeri"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1974E5]">
                      🔥 Sıcak Baskı Ücreti (+TL)
                    </label>
                    <input
                      type="number"
                      value={pHotStampPrice}
                      onChange={(e) => setPHotStampPrice(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#1974E5] bg-white px-3 text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Photo & Video Upload */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold">
                      📷 Ürün Fotoğrafı (Cihazdan Seç veya Link Gir)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-neutral-300 px-3 text-xs"
                      />
                      <label className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-neutral-900 px-3 text-xs font-bold text-white">
                        Dosya Seç
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handlePhotoFile(e.target.files, (url) =>
                              setPImage(url)
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold">
                      🎬 Ürün Videosu (MP4 Linki veya Dosya)
                    </label>
                    <input
                      value={pVideo}
                      onChange={(e) => setPVideo(e.target.value)}
                      placeholder="https://...mp4"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold">
                    Ürün Açıklaması
                  </label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Ürün detaylarını yazın…"
                    className="mt-1 w-full rounded-xl border border-neutral-300 p-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1974E5] px-8 py-3 text-xs font-extrabold uppercase tracking-wider text-white"
                >
                  ✓ Ürünü Kaydet ve Yayınla
                </button>
              </form>
            )}

            {/* Product List with Instant Inline Dimension & Price Editing */}
            <div className="grid grid-cols-1 gap-4">
              {store.products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xs"
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="flex gap-4 lg:col-span-4">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-neutral-400">
                          {prod.sku}
                        </span>
                        <h3 className="text-base font-extrabold text-neutral-900">
                          {prod.name}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-[#1974E5]">
                          {formatTRY(prod.price)}{" "}
                          <span className="text-neutral-400 line-through">
                            {formatTRY(prod.compareAtPrice)}
                          </span>
                        </p>
                        <Link
                          href={`/urun/${prod.slug}`}
                          className="mt-2 inline-block text-xs font-bold text-neutral-700 underline"
                        >
                          Ürün Sayfasında Gör ↗
                        </Link>
                      </div>
                    </div>

                    {/* Editable Price, Hot Stamp Price, Video URL & Dimensions */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500">
                          Satış Fiyatı (TL)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={prod.price}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.products[idx].price =
                              Number(e.target.value) || 0;
                            updateStore(next);
                          }}
                          className="mt-1 h-9 w-full rounded-xl border border-neutral-300 px-2.5 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1974E5]">
                          Sıcak Baskı Ücreti (+TL)
                        </label>
                        <input
                          type="number"
                          value={prod.hotStampPrice}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.products[idx].hotStampPrice =
                              Number(e.target.value) || 0;
                            updateStore(next);
                          }}
                          className="mt-1 h-9 w-full rounded-xl border border-[#1974E5] px-2.5 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500">
                          Yükseklik Boyutu
                        </label>
                        <input
                          value={prod.specs[0]?.value || ""}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            if (next.products[idx].specs[0]) {
                              next.products[idx].specs[0].value =
                                e.target.value;
                              updateStore(next);
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-xl border border-neutral-300 px-2.5 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500">
                          Genişlik Boyutu
                        </label>
                        <input
                          value={prod.specs[1]?.value || ""}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            if (next.products[idx].specs[1]) {
                              next.products[idx].specs[1].value =
                                e.target.value;
                              updateStore(next);
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-xl border border-neutral-300 px-2.5 text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-4">
                        <label className="block text-[11px] font-bold text-neutral-500">
                          🎬 Ürün Videosu (MP4 URL)
                        </label>
                        <input
                          value={prod.videoUrl || ""}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.products[idx].videoUrl = e.target.value;
                            updateStore(next);
                          }}
                          placeholder="Ürün videosu MP4 adresi…"
                          className="mt-1 h-9 w-full rounded-xl border border-neutral-300 px-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 4: SICAK BASKI & HEDİYE PAKETİ (UPSELL) YÖNETİMİ   */}
        {/* ===================================================== */}
        {activeTab === "baski_hediye" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Hot Stamp & Gift Wrap Global Pricing */}
            <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-5">
              <h2 className="text-lg font-extrabold text-neutral-900">
                🔥 Sıcak Baskı & Kişiselleştirme Fiyatları
              </h2>
              <p className="text-xs text-neutral-500">
                Ürün detay sayfasında ve sepette müşterinin göreceği sıcak baskı
                ve hazır sembol fiyatlarını buradan değiştirebilirsiniz.
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-800">
                  Varsayılan Sıcak Baskı Ücreti (+TL)
                </label>
                <input
                  type="number"
                  value={store.settings.defaultHotStampPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const next = structuredClone(store);
                    next.settings.defaultHotStampPrice = val;
                    next.products.forEach((p) => {
                      p.hotStampPrice = val;
                    });
                    updateStore(next);
                    notify("✓ Tüm ürünlerde Sıcak Baskı fiyatı güncellendi");
                  }}
                  className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm font-bold"
                />
              </div>

              <div className="rounded-2xl bg-blue-50 p-4 text-xs text-neutral-700">
                <p className="font-bold text-[#1974E5]">
                  Nasıl Çalışır?
                </p>
                <p className="mt-1">
                  Müşteri ürün sayfasında <strong>Sıcak Baskı</strong>{" "}
                  seçtiğinde belirlediğiniz bu ücret (+₺
                  {store.settings.defaultHotStampPrice.toFixed(2)}) anında{" "}
                  <strong>SEPETE EKLE</strong> butonundaki fiyata eklenir ve
                  sepette ayrıntılı gösterilir.
                </p>
              </div>
            </div>

            {/* Right: "Birlikte indirimli almak ister misin?" Hediye Paketi & Ek Ürünler */}
            <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-7">
              <h2 className="text-lg font-extrabold text-neutral-900">
                🎁 &ldquo;Birlikte İndirimli Almak İster Misin?&rdquo; (Hediye Paketi &
                Ek Ürünler)
              </h2>
              <p className="text-xs text-neutral-500">
                Ürün sayfasında sepete ekle butonunun üstünde çıkan ekstra
                ücretli Hediye Paketi, Deri Bakım Kremi ve Çakmak seçeneklerinin
                fiyatlarını yönetin:
              </p>

              <div className="space-y-3">
                {store.upsells.map((up, idx) => (
                  <div
                    key={up.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={up.image}
                        alt={up.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <input
                          value={up.name}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.upsells[idx].name = e.target.value;
                            updateStore(next);
                          }}
                          className="text-sm font-bold text-neutral-900 focus:outline-none"
                        />
                        <p className="text-[11px] text-neutral-500">
                          {up.isGiftWrap
                            ? "🎁 Hediye Paketi Seçeneği"
                            : "✨ Tamamlayıcı Kasa Önü Ürün"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Ekstra Ücret (TL)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={up.price}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.upsells[idx].price =
                              Number(e.target.value) || 0;
                            updateStore(next);
                          }}
                          className="h-9 w-28 rounded-xl border border-neutral-300 px-2.5 text-xs font-bold"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={up.active}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.upsells[idx].active = e.target.checked;
                            updateStore(next);
                          }}
                          className="h-4 w-4 accent-[#1974E5]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 5: İADELER KONTROLÜ                               */}
        {/* ===================================================== */}
        {activeTab === "iadeler" && (
          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h2 className="text-lg font-extrabold text-neutral-900">
              ↩️ İade ve Değişim Talepleri Kontrolü
            </h2>
            <p className="text-xs text-neutral-500">
              Müşterilerden gelen iade/değişim taleplerini, üründe isim baskısı
              olup olmadığını kontrol ederek onaylayın veya reddedin.
            </p>

            <div className="space-y-3">
              {store.returns.map((ret, idx) => (
                <div
                  key={ret.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold">
                        Sipariş #{ret.orderNumber}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          ret.hasPersonalization
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {ret.hasPersonalization
                          ? "İsim Baskılı Ürün"
                          : "Baskısız (İadeye Uygun)"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      {ret.productName} — {formatTRY(ret.refundAmount)}
                    </p>
                    <p className="text-xs text-neutral-600">
                      <strong>Müşteri:</strong> {ret.customerName} (
                      {ret.customerPhone}) • <strong>Sebep:</strong>{" "}
                      {ret.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={ret.status}
                      onChange={(e) => {
                        const next = structuredClone(store);
                        next.returns[idx].status = e.target
                          .value as typeof ret.status;
                        updateStore(next);
                        notify("✓ İade durumu güncellendi");
                      }}
                      className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                    >
                      <option value="pending">İnceleniyor</option>
                      <option value="approved">Onaylandı (DHL Kod Verildi)</option>
                      <option value="completed">Ücret İadesi Yapıldı</option>
                      <option value="rejected">
                        Reddedildi (Kişiye Özel Baskılı)
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 6: MÜŞTERİ SORULARI                               */}
        {/* ===================================================== */}
        {activeTab === "sorular" && (
          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h2 className="text-lg font-extrabold text-neutral-900">
              💬 Müşteri Soruları Yönetimi
            </h2>
            <p className="text-xs text-neutral-500">
              Ürün sayfalarından müşterilerin sorduğu soruları buradan
              yanıtlayın; yanıtınız anında ürün sayfasında yayınlanır.
            </p>

            <div className="space-y-4">
              {store.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-neutral-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-[#1974E5]">
                        {q.productName}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        • {q.customerName} ({q.customerPhone}) • {q.createdAt}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        q.status === "answered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status === "answered"
                        ? "✓ Yanıtlandı"
                        : "Yanıt Bekliyor"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-neutral-900">
                    Soru: &ldquo;{q.question}&rdquo;
                  </p>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={
                        answerDrafts[q.id] !== undefined
                          ? answerDrafts[q.id]
                          : q.answer || ""
                      }
                      onChange={(e) =>
                        setAnswerDrafts((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      placeholder="Müşteriye yanıtınızı yazın…"
                      className="h-10 flex-1 rounded-xl border border-neutral-300 px-3.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const ans =
                          answerDrafts[q.id] !== undefined
                            ? answerDrafts[q.id]
                            : q.answer || "";
                        const next = structuredClone(store);
                        next.questions[idx].answer = ans;
                        next.questions[idx].status = "answered";
                        updateStore(next);
                        notify("✓ Yanıt kaydedildi ve ürün sayfasında yayınlandı");
                      }}
                      className="rounded-xl bg-[#1974E5] px-4 text-xs font-bold text-white"
                    >
                      Yanıtı Yayınla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 7: ÜRÜN YORUMLARI YÖNETİMİ                        */}
        {/* ===================================================== */}
        {activeTab === "yorumlar" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Add / Customize Review */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRevAuthor.trim() || !newRevComment.trim()) return;
                const prod =
                  store.products.find((p) => p.id === newRevProdId) ||
                  store.products[0];
                const next = structuredClone(store);
                next.reviews.unshift({
                  id: `rev-${Date.now()}`,
                  productId: prod.id,
                  productName: prod.name,
                  author: newRevAuthor.trim(),
                  rating: newRevRating,
                  comment: newRevComment.trim(),
                  date: new Date().toISOString().slice(0, 10),
                  verified: true,
                  stampChoice: newRevStamp,
                  published: true,
                });
                updateStore(next);
                setNewRevAuthor("");
                setNewRevComment("");
                notify("✓ Yıldızlı müşteri yorumu eklendi!");
              }}
              className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-4"
            >
              <h2 className="text-base font-extrabold text-neutral-900">
                ⭐ Yeni Yıldızlı Yorum Ekle
              </h2>
              <p className="text-xs text-neutral-500">
                İstediğiniz ürüne doğrulanmış rozetli ve yıldızlı müşteri yorumu
                ekleyebilirsiniz.
              </p>

              <div>
                <label className="block text-xs font-bold">Ürün Seçin</label>
                <select
                  value={newRevProdId}
                  onChange={(e) => setNewRevProdId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold">
                  Müşteri Adı Soyadı
                </label>
                <input
                  required
                  value={newRevAuthor}
                  onChange={(e) => setNewRevAuthor(e.target.value)}
                  placeholder="Örn: Serkan T."
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold">Yıldız</label>
                  <select
                    value={newRevRating}
                    onChange={(e) => setNewRevRating(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                  >
                    <option value={5}>5 Yıldız (★★★★★)</option>
                    <option value={4}>4 Yıldız (★★★★)</option>
                    <option value={3}>3 Yıldız (★★★)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold">
                    Baskı Tercihi
                  </label>
                  <input
                    value={newRevStamp}
                    onChange={(e) => setNewRevStamp(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold">Yorum Metni</label>
                <textarea
                  required
                  rows={3}
                  value={newRevComment}
                  onChange={(e) => setNewRevComment(e.target.value)}
                  placeholder="Yorum içeriği…"
                  className="mt-1 w-full rounded-xl border border-neutral-300 p-3 text-xs"
                />
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-xl bg-[#1974E5] text-xs font-bold text-white"
              >
                ＋ Yorumu Yayınla
              </button>
            </form>

            {/* Existing Reviews Management */}
            <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-8">
              <h2 className="text-base font-extrabold text-neutral-900">
                Yayınlanan Yorumlar ({store.reviews.length})
              </h2>
              <div className="space-y-3">
                {store.reviews.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-neutral-200 p-3.5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">
                          {"★".repeat(r.rating)}
                        </span>
                        <span className="text-xs font-bold">{r.author}</span>
                        <span className="text-[11px] text-neutral-400">
                          • {r.productName}
                        </span>
                      </div>
                      <input
                        value={r.comment}
                        onChange={(e) => {
                          const next = structuredClone(store);
                          next.reviews[idx].comment = e.target.value;
                          updateStore(next);
                        }}
                        className="mt-1 w-full rounded-lg border border-transparent bg-neutral-50 px-2 py-1 text-xs text-neutral-700 focus:border-neutral-300 focus:bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = structuredClone(store);
                        next.reviews.splice(idx, 1);
                        updateStore(next);
                        notify("Yorum silindi");
                      }}
                      className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 8: ÖDEME YÖNTEMLERİ & MAĞAZA AYARLARI             */}
        {/* ===================================================== */}
        {activeTab === "odeme_ayar" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="text-lg font-extrabold text-neutral-900">
                💳 Ödeme Yöntemleri & Sanal POS Ayarları
              </h2>
              <div>
                <label className="block text-xs font-bold">
                  Aktif Sanal POS Altyapısı
                </label>
                <input
                  value={store.settings.paymentMethods.posProvider}
                  onChange={(e) => {
                    const next = structuredClone(store);
                    next.settings.paymentMethods.posProvider = e.target.value;
                    updateStore(next);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold">
                  Kapıda Ödeme Hizmet Bedeli (TL)
                </label>
                <input
                  type="number"
                  value={store.settings.paymentMethods.codFee}
                  onChange={(e) => {
                    const next = structuredClone(store);
                    next.settings.paymentMethods.codFee =
                      Number(e.target.value) || 0;
                    updateStore(next);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold">
                  Havale / EFT IBAN Bilgisi
                </label>
                <input
                  value={store.settings.paymentMethods.bankIban}
                  onChange={(e) => {
                    const next = structuredClone(store);
                    next.settings.paymentMethods.bankIban = e.target.value;
                    updateStore(next);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="text-lg font-extrabold text-neutral-900">
                🏪 Mağaza & Kargo Barajı Ayarları
              </h2>
              <div>
                <label className="block text-xs font-bold">Marka Adı</label>
                <input
                  value={store.settings.brandName}
                  onChange={(e) => {
                    const next = structuredClone(store);
                    next.settings.brandName = e.target.value;
                    updateStore(next);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold">
                  Ücretsiz Kargo Alt Limiti (TL)
                </label>
                <input
                  type="number"
                  value={store.settings.freeShippingThreshold}
                  onChange={(e) => {
                    const next = structuredClone(store);
                    next.settings.freeShippingThreshold =
                      Number(e.target.value) || 0;
                    updateStore(next);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetStore();
                    notify("✓ Demo verileri varsayılana sıfırlandı");
                  }}
                  className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700"
                >
                  Tüm Demo Verilerini Varsayılana Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* PRINTABLE CARGO LABEL MODAL ("Kargo Etiketi Çıkart")   */}
      {/* ===================================================== */}
      {labelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="no-print mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900">
                🏷️ Kargo Barkod & Atölye Baskı Etiketi
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#1974E5] px-4 py-2 text-xs font-bold text-white"
                >
                  🖨️ Yazdır (PDF / Termal Yazıcı)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelOrder(null)}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Thermal Cargo Label Box */}
            <div className="rounded-2xl border-2 border-black p-5 text-black">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <p className="text-lg font-black uppercase">
                    {labelOrder.cargoCompany}
                  </p>
                  <p className="text-xs font-bold">
                    Gönderici: {store.settings.brandName} ({store.settings.address})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-black">
                    #{labelOrder.orderNumber}
                  </p>
                  <p className="text-[11px]">{labelOrder.createdAt}</p>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="my-4 border-b-2 border-black pb-4 text-center">
                <div className="mx-auto flex h-14 max-w-xs items-center justify-center bg-[repeating-linear-gradient(90deg,#000,#000_3px,#fff_3px,#fff_6px)]" />
                <p className="mt-1 font-mono text-base font-black tracking-widest">
                  *{labelOrder.trackingNumber}*
                </p>
              </div>

              <div className="border-b-2 border-black pb-3 text-xs">
                <p className="font-black uppercase">ALICI BİLGİLERİ:</p>
                <p className="mt-1 text-sm font-bold">
                  {labelOrder.customerName} — {labelOrder.customerPhone}
                </p>
                <p className="mt-0.5">{labelOrder.address}</p>
                <p className="font-bold">
                  {labelOrder.district} / {labelOrder.city}
                </p>
              </div>

              <div className="pt-3 text-xs">
                <p className="font-black uppercase">
                  PAKET & ATÖLYE BASKI İÇERİĞİ:
                </p>
                {labelOrder.items.map((it) => (
                  <div key={it.cartItemId} className="mt-1.5">
                    <p className="font-bold">
                      • {it.name} ({it.variantName}) × {it.quantity}
                    </p>
                    {it.personalization && (
                      <p className="font-mono text-xs font-black text-black">
                        [BASKI: {it.personalization.typeLabel} | İSİM: &ldquo;
                        {it.personalization.customText}&rdquo; | FONT:{" "}
                        {it.personalization.fontFamily}]
                      </p>
                    )}
                    {it.upsells.length > 0 && (
                      <p className="font-bold">
                        [EK PAKET:{" "}
                        {it.upsells.map((u) => u.name).join(", ")}]
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* PRINTABLE E-ARCHIVE INVOICE MODAL ("Fatura")          */}
      {/* ===================================================== */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="no-print mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900">
                🧾 E-Arşiv Fatura Önizleme ({invoiceOrder.invoiceNumber})
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#1974E5] px-4 py-2 text-xs font-bold text-white"
                >
                  🖨️ Faturayı Yazdır / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-300 p-6 text-xs text-neutral-800">
              <div className="flex justify-between border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-base font-black">
                    {store.settings.brandName} DERİ ÜRÜNLERİ A.Ş.
                  </p>
                  <p>{store.settings.address}</p>
                  <p>Tel: {store.settings.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">E-ARŞİV FATURA</p>
                  <p className="font-mono font-bold">
                    No: {invoiceOrder.invoiceNumber}
                  </p>
                  <p>Tarih: {invoiceOrder.createdAt}</p>
                </div>
              </div>

              <div className="my-4">
                <p className="font-bold">SAYIN: {invoiceOrder.customerName}</p>
                <p>
                  {invoiceOrder.address} — {invoiceOrder.district}/
                  {invoiceOrder.city}
                </p>
                <p>
                  Tel: {invoiceOrder.customerPhone} • E-Posta:{" "}
                  {invoiceOrder.customerEmail}
                </p>
              </div>

              <table className="w-full border-collapse border-t border-b border-neutral-300 text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="py-2">Açıklama</th>
                    <th className="py-2 text-right">Adet</th>
                    <th className="py-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoiceOrder.items.map((item) => (
                    <React.Fragment key={item.cartItemId}>
                      <tr>
                        <td className="py-2 font-bold">
                          {item.name} ({item.variantName})
                        </td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right font-bold">
                          {formatTRY(item.basePrice * item.quantity)}
                        </td>
                      </tr>
                      {item.personalization &&
                        item.personalization.price > 0 && (
                          <tr>
                            <td className="py-1.5 pl-4 text-neutral-600">
                              + {item.personalization.typeLabel} (
                              {item.personalization.customText})
                            </td>
                            <td className="py-1.5 text-right">
                              {item.quantity}
                            </td>
                            <td className="py-1.5 text-right">
                              {formatTRY(
                                item.personalization.price * item.quantity
                              )}
                            </td>
                          </tr>
                        )}
                      {item.upsells.map((u) => (
                        <tr key={u.id}>
                          <td className="py-1.5 pl-4 text-neutral-600">
                            + {u.name}
                          </td>
                          <td className="py-1.5 text-right">{item.quantity}</td>
                          <td className="py-1.5 text-right">
                            {formatTRY(u.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end">
                <div className="w-56 space-y-1">
                  <div className="flex justify-between">
                    <span>Ürün Ara Toplam:</span>
                    <span>{formatTRY(invoiceOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sıcak Baskı Hizmeti:</span>
                    <span>{formatTRY(invoiceOrder.personalizationTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hediye Paketi & Ek Ürün:</span>
                    <span>{formatTRY(invoiceOrder.upsellTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-black">
                    <span>GENEL TOPLAM (KDV Dahil):</span>
                    <span>{formatTRY(invoiceOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
