"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore, formatTRY } from "@/components/StoreProvider";
import type { Order, Product, ColorVariant } from "@/types/store";
import { TridentLogo } from "@/components/Icons";

const POPULAR_LEATHER_COLORS = [
  { name: "FLOTER SİYAH", colorHex: "#181818" },
  { name: "TABA", colorHex: "#A0522D" },
  { name: "KAHVERENGİ", colorHex: "#4A2E1B" },
  { name: "LACİVERT", colorHex: "#1C2A39" },
  { name: "HAKİ YEŞİL", colorHex: "#3D4A39" },
  { name: "ANTRASİT GRİ", colorHex: "#3A3D40" },
  { name: "BORDO", colorHex: "#5B1E28" },
  { name: "VİZON / BEJ", colorHex: "#9E8B76" },
  { name: "KONYAK DERİ", colorHex: "#8B4513" },
  { name: "KAPUÇİNO", colorHex: "#7B6352" },
];

type AdminTab =
  | "dashboard"
  | "vitrin_tasarim"
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
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [batchLabelOrders, setBatchLabelOrders] = useState<Order[] | null>(null);
  const [batchInvoiceOrders, setBatchInvoiceOrders] = useState<Order[] | null>(null);
  const [designerViewMode, setDesignerViewMode] = useState<"designer" | "split" | "preview">("designer");

  // Editing existing product variants modal
  const [editingVariantProduct, setEditingVariantProduct] = useState<Product | null>(null);

  // Order workflow filter (Tümü, Yeni Siparişler, İşleme Alınanlar, Kargoda/Taşıma Durumu, Teslim Edilenler)
  const [orderFilter, setOrderFilter] = useState<
    "all" | "pending" | "preparing" | "shipped" | "delivered"
  >("all");

  // Barcode Scanner / Kargo Okutucu state (Barkod tabancası veya manuel giriş)
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [scannedOrderId, setScannedOrderId] = useState<string | null>(null);

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

  // Product Variants State for New Product Form
  const [pVariants, setPVariants] = useState<ColorVariant[]>([
    {
      id: "v-def-1",
      name: "FLOTER SİYAH",
      colorHex: "#181818",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=85",
      stock: 35,
    },
    {
      id: "v-def-2",
      name: "TABA",
      colorHex: "#A0522D",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=85",
      stock: 25,
    },
    {
      id: "v-def-3",
      name: "KAHVERENGİ",
      colorHex: "#4A2E1B",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=85",
      stock: 20,
    },
  ]);

  // Question answer draft
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  // Storefront Designer & Extra Banner Builder states
  const [showExtraBannerForm, setShowExtraBannerForm] = useState(false);
  const [ebTitle, setEbTitle] = useState("");
  const [ebCta, setEbCta] = useState("Koleksiyonu İncele");
  const [ebLink, setEbLink] = useState("/kategori/erkek-el-cantasi");
  const [ebImg, setEbImg] = useState(
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1600&q=85"
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSub, setNewCatSub] = useState("");
  const [newCatImg, setNewCatImg] = useState(
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  );

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

  // handle local video upload from phone/computer (MP4/MOV/WebM)
  const handleVideoFile = (
    files: FileList | null,
    onDone: (videoUrl: string) => void
  ) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onDone(reader.result);
          notify(`✓ Video yüklendi: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const blobUrl = URL.createObjectURL(file);
      onDone(blobUrl);
      notify(`✓ Video seçildi: ${file.name}`);
    }
  };

  // Live metrics
  const totalRevenue = store.orders.reduce((s, o) => s + o.total, 0);
  const pendingOrdersCount = store.orders.filter(
    (o) => o.status === "pending"
  ).length;
  const preparingOrdersCount = store.orders.filter(
    (o) => o.status === "preparing"
  ).length;
  const shippedOrdersCount = store.orders.filter(
    (o) => o.status === "shipped"
  ).length;
  const deliveredOrdersCount = store.orders.filter(
    (o) => o.status === "delivered"
  ).length;
  const unansweredCount = store.questions.filter(
    (q) => q.status === "unanswered"
  ).length;
  const pendingReturnsCount = store.returns.filter(
    (r) => r.status === "pending"
  ).length;

  // Sound effect for barcode scan
  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio fallback
    }
  };

  // Barcode Scan Handler (Barkod tabancası veya manuel giriş okutulduğunda otomatik kargoya verip taşıma durumuna geçirir)
  const handleBarcodeScan = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return;

    const next = structuredClone(store);
    const matched = next.orders.find((o) => {
      const tracking = (o.trackingNumber || "").toLowerCase();
      const orderNo = (o.orderNumber || "").toLowerCase();
      const search = cleanCode.toLowerCase();
      return (
        tracking === search ||
        orderNo === search ||
        orderNo.replace(/[^a-z0-9]/g, "") === search.replace(/[^a-z0-9]/g, "") ||
        o.id.toLowerCase() === search
      );
    });

    if (matched) {
      playBeep();
      matched.status = "shipped";
      matched.cargoCompany = "Aras Kargo";
      if (!matched.trackingNumber || !matched.trackingNumber.startsWith("418")) {
        matched.trackingNumber =
          "418" + Math.floor(100000000 + Math.random() * 900000000);
      }
      updateStore(next);
      setBarcodeInput("");
      setScannedOrderId(matched.id);
      setBarcodeScanFeedback({
        type: "success",
        message: `BİP! ✓ Barkod Okundu: Sipariş #${matched.orderNumber} (${matched.customerName}) Aras Kargo ile Taşıma Durumuna Alındı!`,
      });
      notify(`✓ Sipariş #${matched.orderNumber} kargoya verildi!`);
      setTimeout(() => {
        setBarcodeScanFeedback(null);
      }, 6000);
    } else {
      setBarcodeScanFeedback({
        type: "error",
        message: `⚠️ Barkod veya kod "${cleanCode}" ile eşleşen sipariş bulunamadı! Lütfen kodu kontrol edin.`,
      });
      setTimeout(() => {
        setBarcodeScanFeedback(null);
      }, 4500);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const slug = pName
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const finalVariants: ColorVariant[] =
      pVariants.length > 0
        ? pVariants.map((v, i) => ({
            ...v,
            id: v.id || `v-${Date.now()}-${i}`,
            image: v.image || pImage,
          }))
        : [
            {
              id: `v-${Date.now()}-1`,
              name: "FLOTER SİYAH",
              colorHex: "#181818",
              image: pImage,
              stock: 30,
            },
          ];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: pSku.trim() || `GTT-${Date.now().toString().slice(-4)}`,
      slug: `${slug}-${Date.now().toString().slice(-3)}`,
      name: pName.trim(),
      brand: store.settings.brandName || "BEEBLACK",
      categorySlug: pCat,
      price: Number(pPrice) || 1999.9,
      compareAtPrice: Number(pCompare) || 2499.9,
      rating: 4.95,
      reviewCount: 12,
      image: pImage,
      gallery: Array.from(new Set([pImage, ...finalVariants.map((v) => v.image).filter(Boolean)])),
      videoUrl: pVideo.trim() || undefined,
      variants: finalVariants,
      specs: [
        { icon: "height", label: "Yükseklik", value: pHeight || "11 CM" },
        { icon: "width", label: "Genişlik", value: pWidth || "18.5 CM" },
        { icon: "carry", label: "Taşıma", value: pCarry || "Ergonomik Tutma" },
      ],
      description:
        pDesc.trim() ||
        "%100 el yapımı hakiki deri, kişiye özel sıcak baskı ve özel hediye kutusu seçeneğiyle.",
      materialNote:
        `${store.settings.brandName || "BeeBlack"} ürünlerinde kullanılan malzeme %100 hakiki deridir.`,
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
      key: "vitrin_tasarim",
      label: "🎨 Mağaza Düzenleme (Vitrin & Banner)",
      badge: "Trendyol",
    },
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
    <div className="admin-font min-h-screen bg-[#F3F4F6] font-sans text-neutral-900 tracking-normal antialiased">
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
                    SİPARİŞ İŞLEM DURUMLARI
                  </span>
                  <span className="text-lg">📦</span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#1974E5]">
                  {pendingOrdersCount} Yeni • {preparingOrdersCount} İşlemde • {shippedOrdersCount} Kargoda
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
        {/* TAB: TRENDYOL STYLE STOREFRONT & BANNER DESIGNER      */}
        {/* ===================================================== */}
        {activeTab === "vitrin_tasarim" && (
          <div className="space-y-6">
            {/* Header Info & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900">
                  🎨 Mağaza Düzenleme & Vitrin Tasarım Merkezi
                </h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Trendyol mağaza düzenleme alanı gibi: Ana sayfa bloklarını dilediğiniz gibi sıralayın (↑/↓), ekstra kampanya bannerları ekleyin, fotoğrafları doğrudan telefon/bilgisayarınızdan yükleyin ve canlı demoda anında görün.
                </p>
              </div>

              {/* View Mode Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDesignerViewMode("designer")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    designerViewMode === "designer"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  ⚙️ Mağaza Düzenleme
                </button>
                <button
                  type="button"
                  onClick={() => setDesignerViewMode("preview")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    designerViewMode === "preview"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  📱 Canlı Demo Önizleme
                </button>
                <button
                  type="button"
                  onClick={() => setDesignerViewMode("split")}
                  className={`hidden sm:inline-flex rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    designerViewMode === "split"
                      ? "bg-[#1974E5] text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  ◫ İkili Görünüm (Düzenle + Önizle)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewKey((k) => k + 1);
                    notify("🔄 Canlı mağaza önizlemesi yenilendi");
                  }}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                  title="Önizlemeyi Yenile"
                >
                  🔄 Yenile
                </button>
                <Link
                  href="/"
                  target="_blank"
                  className="rounded-xl bg-[#1974E5] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#1461c4]"
                >
                  Canlı Vitrini Aç ↗
                </Link>
              </div>
            </div>

            {/* If Preview Only Mode */}
            {designerViewMode === "preview" && (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-900 p-6 shadow-xl text-white">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-bold">Canlı Mağaza Demosu (Gerçek Zamanlı Önizleme)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                        previewDevice === "mobile"
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      📱 Mobil (390px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                        previewDevice === "desktop"
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      💻 Masaüstü (Geniş)
                    </button>
                  </div>
                </div>

                <div className="flex justify-center bg-neutral-950/80 p-4 rounded-2xl overflow-hidden">
                  <iframe
                    key={previewKey}
                    src="/"
                    title="Canlı Mağaza Önizleme"
                    className={`border-0 bg-white transition-all duration-300 ${
                      previewDevice === "mobile"
                        ? "h-[760px] w-[390px] rounded-[36px] shadow-2xl border-[8px] border-neutral-800"
                        : "h-[760px] w-full rounded-2xl shadow-xl"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Designer / Split View Container */}
            {designerViewMode !== "preview" && (
              <div className={`grid grid-cols-1 gap-6 ${designerViewMode === "split" ? "xl:grid-cols-12" : ""}`}>
                <div className={`space-y-6 ${designerViewMode === "split" ? "xl:col-span-7" : ""}`}>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* 1. HOME PAGE SECTION ORDER & VISIBILITY (Trendyol Blok Sıralama) */}
                    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-neutral-900">
                            1. Blok Sıralaması
                          </h3>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            Oklarla bölümleri taşıyın:
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowExtraBannerForm((v) => !v)}
                          className="rounded-xl bg-[#1974E5] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1461c4]"
                        >
                          {showExtraBannerForm ? "✕ Kapat" : "＋ Ekstra Banner Ekle"}
                        </button>
                      </div>

                      {/* Extra Custom Banner Creation Form */}
                      {showExtraBannerForm && (
                        <div className="rounded-2xl border-2 border-dashed border-[#1974E5]/40 bg-blue-50/40 p-4 space-y-3">
                          <p className="text-xs font-extrabold text-[#1974E5]">
                            🎉 Yeni Kampanya Bannerı Oluştur
                          </p>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700">
                              Banner Başlığı
                            </label>
                            <input
                              value={ebTitle}
                              onChange={(e) => setEbTitle(e.target.value)}
                              placeholder="Örn: VINTAGE DERİDE NET %20 İNDİRİM"
                              className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700">
                                Buton Yazısı
                              </label>
                              <input
                                value={ebCta}
                                onChange={(e) => setEbCta(e.target.value)}
                                placeholder="Örn: Fırsatları Gör"
                                className="mt-1 h-8 w-full rounded-xl border border-neutral-300 bg-white px-2.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700">
                                Yönlendirilecek Sayfa
                              </label>
                              <input
                                value={ebLink}
                                onChange={(e) => setEbLink(e.target.value)}
                                placeholder="/kategori/erkek-el-cantasi"
                                className="mt-1 h-8 w-full rounded-xl border border-neutral-300 bg-white px-2.5 text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-neutral-700">
                                Banner Fotoğrafı
                              </label>
                              <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-neutral-800">
                                📷 Cihazdan Seç
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handlePhotoFile(e.target.files, (url) => setEbImg(url))
                                  }
                                />
                              </label>
                            </div>

                            {/* Instant Photo Preview */}
                            <div className="mt-2 h-24 w-full overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
                              <img
                                src={ebImg}
                                alt="Seçilen Banner Görseli"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!ebTitle.trim()) {
                                notify("⚠️ Lütfen banner için bir başlık girin.");
                                return;
                              }
                              const newBannerId = `banner-${Date.now()}`;
                              const next = structuredClone(store);
                              next.settings.homeBlocks.push({
                                id: newBannerId,
                                type: "custom_banner",
                                title: `Banner: ${ebTitle.trim()}`,
                                enabled: true,
                                bannerData: {
                                  image: ebImg,
                                  heading: ebTitle.trim(),
                                  ctaText: ebCta.trim() || "İncele",
                                  linkUrl: ebLink.trim() || "/kategori/erkek-el-cantasi",
                                },
                              });
                              updateStore(next);
                              setShowExtraBannerForm(false);
                              setEbTitle("");
                              setPreviewKey((k) => k + 1);
                              notify("✓ Yeni kampanya bannerı vitrine eklendi! Sırasını yukarı/aşağı taşıyabilirsiniz.");
                            }}
                            className="h-9 w-full rounded-xl bg-[#1974E5] text-xs font-extrabold text-white shadow hover:bg-[#1461c4]"
                          >
                            💾 Bannerı Kaydet & Vitrine Ekle
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {(store.settings.homeBlocks || []).map((blk, idx) => (
                          <div
                            key={blk.id}
                            className={`flex items-center justify-between gap-2 rounded-2xl border p-3 transition ${
                              blk.enabled
                                ? "border-neutral-200 bg-[#FAFAFA]"
                                : "border-dashed border-neutral-200 bg-neutral-100/60 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-[11px] font-bold text-white">
                                {idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-neutral-900">
                                  {blk.title}
                                </span>
                                {(blk.id.startsWith("banner-") || blk.type === "custom_banner") && (
                                  <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-800">
                                    ÖZEL BANNER
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = structuredClone(store);
                                  const arr = next.settings.homeBlocks;
                                  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                  notify("✓ Blok sırası güncellendi");
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-300 bg-white text-xs font-bold hover:bg-neutral-100 disabled:opacity-30"
                                title="Yukarı Taşı"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={idx === (store.settings.homeBlocks || []).length - 1}
                                onClick={() => {
                                  const next = structuredClone(store);
                                  const arr = next.settings.homeBlocks;
                                  [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                  notify("✓ Blok sırası güncellendi");
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-300 bg-white text-xs font-bold hover:bg-neutral-100 disabled:opacity-30"
                                title="Aşağı Taşı"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = structuredClone(store);
                                  next.settings.homeBlocks[idx].enabled = !blk.enabled;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                  notify(
                                    blk.enabled
                                      ? "Bölüm gizlendi"
                                      : "Bölüm vitrinde aktifleştirildi"
                                  );
                                }}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                  blk.enabled
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-neutral-200 text-neutral-600"
                                }`}
                              >
                                {blk.enabled ? "Açık" : "Gizli"}
                              </button>
                              {(blk.id.startsWith("banner-") || blk.type === "custom_banner") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = structuredClone(store);
                                    next.settings.homeBlocks.splice(idx, 1);
                                    updateStore(next);
                                    setPreviewKey((k) => k + 1);
                                    notify("✓ Kampanya bannerı silindi");
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100"
                                  title="Bannerı Sil"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. BANNER & VISUAL CONTENT EDITOR */}
                    <div className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-7">
                      <h3 className="text-base font-extrabold text-neutral-900">
                        2. Ana Banner, Duyuru Bandı & Video Düzenleme
                      </h3>

                      {/* Hero Banner Controls */}
                      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#F6F6F6] p-4 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <img
                            src={store.settings.heroImage}
                            alt="Ana Banner"
                            className="h-28 w-full rounded-xl object-cover"
                          />
                          <label className="mt-2 flex h-9 cursor-pointer items-center justify-center rounded-xl bg-neutral-900 text-xs font-bold text-white hover:bg-neutral-700">
                            📷 Banner Fotoğrafı Değiştir
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handlePhotoFile(e.target.files, (url) => {
                                  const next = structuredClone(store);
                                  next.settings.heroImage = url;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="space-y-3 sm:col-span-8">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-600">
                              Ana Banner Başlığı (H1)
                            </label>
                            <input
                              value={store.settings.heroTitle}
                              onChange={(e) => {
                                const next = structuredClone(store);
                                next.settings.heroTitle = e.target.value;
                                updateStore(next);
                                setPreviewKey((k) => k + 1);
                              }}
                              className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600">
                                Banner Buton Yazısı
                              </label>
                              <input
                                value={store.settings.heroCta}
                                onChange={(e) => {
                                  const next = structuredClone(store);
                                  next.settings.heroCta = e.target.value;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600">
                                Ürün Slider Başlığı
                              </label>
                              <input
                                value={store.settings.featuredTitle || "YILBAŞI"}
                                onChange={(e) => {
                                  const next = structuredClone(store);
                                  next.settings.featuredTitle = e.target.value;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-600">
                              Banner Görsel URL
                            </label>
                            <input
                              value={store.settings.heroImage}
                              onChange={(e) => {
                                const next = structuredClone(store);
                                next.settings.heroImage = e.target.value;
                                updateStore(next);
                                setPreviewKey((k) => k + 1);
                              }}
                              className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Top Marquee Announcements */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-800">
                          📢 En Üstteki Kayan Duyuru Yazıları (Her satıra 1 duyuru)
                        </label>
                        <textarea
                          rows={3}
                          value={store.settings.announcements.join("\n")}
                          onChange={(e) => {
                            const next = structuredClone(store);
                            next.settings.announcements = e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            updateStore(next);
                            setPreviewKey((k) => k + 1);
                          }}
                          className="mt-1.5 w-full rounded-xl border border-neutral-300 p-3 text-xs font-semibold"
                        />
                      </div>

                      {/* Lookbook & Promo Video */}
                      <div className="space-y-4 rounded-2xl bg-[#F6F6F6] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-800">
                              🎬 Ana Sayfa Tanıtım Videosu (Telefondan / PC'den Yükle)
                            </label>
                            <p className="text-[11px] text-neutral-500">
                              Cihazınızdaki video dosyasını doğrudan seçebilirsiniz
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#1974E5] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1461c4]">
                            📹 Video Dosyası Seç
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) =>
                                handleVideoFile(e.target.files, (url) => {
                                  const next = structuredClone(store);
                                  next.settings.promoVideoUrl = url;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                })
                              }
                            />
                          </label>
                        </div>

                        {store.settings.promoVideoUrl && (
                          <div className="overflow-hidden rounded-xl border border-neutral-300 bg-black">
                            <video
                              controls
                              src={store.settings.promoVideoUrl}
                              className="h-44 w-full object-contain bg-black"
                            />
                            <div className="bg-neutral-900 px-3 py-1.5 text-center text-[11px] font-semibold text-neutral-300">
                              ▶️ Önizleme: Tanıtım videosunu buradan doğrudan izleyip kontrol edebilirsiniz.
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-600">
                              Video Bağlantı Linki (MP4 / Web URL)
                            </label>
                            <input
                              value={store.settings.promoVideoUrl}
                              onChange={(e) => {
                                const next = structuredClone(store);
                                next.settings.promoVideoUrl = e.target.value;
                                updateStore(next);
                                setPreviewKey((k) => k + 1);
                              }}
                              placeholder="https://...mp4"
                              className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-600">
                              ✨ Lookbook Slogan Başlığı
                            </label>
                            <input
                              value={
                                store.settings.lookbookTitle ||
                                "Derinin ardında başka bir dünya."
                              }
                              onChange={(e) => {
                                const next = structuredClone(store);
                                next.settings.lookbookTitle = e.target.value;
                                updateStore(next);
                                setPreviewKey((k) => k + 1);
                              }}
                              className="mt-1 h-9 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. CATEGORY MANAGEMENT (Add, Edit Image/Name, Toggle on Homepage, Delete) */}
                  <div className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900">
                          3. Kategori Yönetimi (Ekle, Düzenle, Görsel Değiştir, Sırala)
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Ana sayfadaki kategori kartlarını ve üst menüdeki kategorileri buradan istediğiniz gibi değiştirebilirsiniz.
                        </p>
                      </div>
                    </div>

                    {/* Add New Category Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCatName.trim()) return;
                        const slug = newCatName
                          .toLocaleLowerCase("tr-TR")
                          .replace(/[^a-z0-9ğüşıöç]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        const next = structuredClone(store);
                        next.categories.push({
                          slug: `${slug}-${Date.now().toString().slice(-3)}`,
                          name: newCatName.trim().toLocaleUpperCase("tr-TR"),
                          subtitle: newCatSub.trim() || "Özel Hakiki Deri Koleksiyonu",
                          image: newCatImg,
                          showOnHome: true,
                        });
                        updateStore(next);
                        setNewCatName("");
                        setNewCatSub("");
                        setPreviewKey((k) => k + 1);
                        notify("✓ Yeni kategori eklendi!");
                      }}
                      className="grid grid-cols-1 gap-3 rounded-2xl border border-dashed border-[#1974E5]/40 bg-blue-50/30 p-4 sm:grid-cols-12"
                    >
                      <div className="sm:col-span-4">
                        <input
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Yeni Kategori Adı (Örn: DERİ KEMER)"
                          className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          value={newCatSub}
                          onChange={(e) => setNewCatSub(e.target.value)}
                          placeholder="Kısa Açıklama (İsteğe bağlı)"
                          className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-4">
                        {newCatImg && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-2xs" title="Seçilen Görsel Önizlemesi">
                            <img
                              src={newCatImg}
                              alt="Kategori Görsel Önizleme"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-800 hover:bg-neutral-50">
                          📷 Görsel
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handlePhotoFile(e.target.files, (url) =>
                                setNewCatImg(url)
                              )
                            }
                          />
                        </label>
                        <button
                          type="submit"
                          className="h-10 flex-1 rounded-xl bg-[#1974E5] px-4 text-xs font-extrabold text-white"
                        >
                          ＋ Kategori Ekle
                        </button>
                      </div>
                    </form>

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {store.categories.map((cat, idx) => (
                        <div
                          key={cat.slug}
                          className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4"
                        >
                          <div className="flex gap-3.5">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover"
                              />
                              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-[10px] font-bold text-white opacity-0 transition hover:opacity-100">
                                Değiştir
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handlePhotoFile(e.target.files, (url) => {
                                      const next = structuredClone(store);
                                      next.categories[idx].image = url;
                                      updateStore(next);
                                      setPreviewKey((k) => k + 1);
                                    })
                                  }
                                />
                              </label>
                            </div>

                            <div className="flex-1 space-y-1.5">
                              <input
                                value={cat.name}
                                onChange={(e) => {
                                  const next = structuredClone(store);
                                  next.categories[idx].name = e.target.value;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-extrabold text-neutral-900"
                              />
                              <input
                                value={cat.subtitle}
                                onChange={(e) => {
                                  const next = structuredClone(store);
                                  next.categories[idx].subtitle = e.target.value;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-600"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-neutral-200/70 pt-2.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700">
                              <input
                                type="checkbox"
                                checked={cat.showOnHome}
                                onChange={(e) => {
                                  const next = structuredClone(store);
                                  next.categories[idx].showOnHome = e.target.checked;
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="h-4 w-4 accent-[#1974E5]"
                              />
                              <span>Ana Sayfada Göster</span>
                            </label>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = structuredClone(store);
                                  const arr = next.categories;
                                  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                disabled={idx === store.categories.length - 1}
                                onClick={() => {
                                  const next = structuredClone(store);
                                  const arr = next.categories;
                                  [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = structuredClone(store);
                                  next.categories.splice(idx, 1);
                                  updateStore(next);
                                  setPreviewKey((k) => k + 1);
                                  notify("Kategori silindi");
                                }}
                                className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* If Split Mode: Right Column Interactive Preview */}
                {designerViewMode === "split" && (
                  <div className="hidden xl:block xl:col-span-5 sticky top-24 self-start">
                    <div className="rounded-3xl border border-neutral-300 bg-neutral-900 p-4 text-white shadow-xl">
                      <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold">Canlı Mağaza Demosu</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("mobile")}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              previewDevice === "mobile"
                                ? "bg-white text-neutral-900"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                          >
                            📱 Mobil
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("desktop")}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              previewDevice === "desktop"
                                ? "bg-white text-neutral-900"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                          >
                            💻 Masaüstü
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewKey((k) => k + 1);
                              notify("🔄 Canlı önizleme yenilendi");
                            }}
                            className="rounded-lg bg-neutral-800 px-2 py-1 text-[11px] font-bold text-neutral-300 hover:bg-neutral-700"
                            title="Yenile"
                          >
                            🔄
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center bg-neutral-950 p-2 rounded-2xl overflow-hidden">
                        <iframe
                          key={previewKey}
                          src="/"
                          title="Split Önizleme"
                          className={`border-0 bg-white transition-all ${
                            previewDevice === "mobile"
                              ? "h-[680px] w-[360px] rounded-[28px] border-[6px] border-neutral-800 shadow-2xl"
                              : "h-[680px] w-full rounded-xl shadow-xl"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === "siparisler" && (
          <div className="space-y-5">
            {/* WORKFLOW TABS (5 AŞAMA: Tümü, Yeni Siparişler, İşleme Alınanlar, Kargoda/Taşıma Durumu, Teslim Edilenler) */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    k: "all",
                    label: `Tümü (${store.orders.length})`,
                    activeCls: "bg-neutral-900 text-white",
                  },
                  {
                    k: "pending",
                    label: `📥 Yeni Siparişler (${pendingOrdersCount})`,
                    activeCls: "bg-amber-600 text-white",
                    badgeCls:
                      pendingOrdersCount > 0
                        ? "border-amber-400 bg-amber-50 text-amber-900 font-extrabold animate-pulse"
                        : "",
                  },
                  {
                    k: "preparing",
                    label: `⚡ İşleme Alındı / Bugün Yapılacaklar (${preparingOrdersCount})`,
                    activeCls: "bg-[#1974E5] text-white",
                  },
                  {
                    k: "shipped",
                    label: `🚚 Kargoda / Taşıma Durumunda (${shippedOrdersCount})`,
                    activeCls: "bg-indigo-600 text-white",
                  },
                  {
                    k: "delivered",
                    label: `✅ Teslim Edilenler (${deliveredOrdersCount})`,
                    activeCls: "bg-emerald-600 text-white",
                  },
                ].map((f) => (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() =>
                      setOrderFilter(
                        f.k as "all" | "pending" | "preparing" | "shipped" | "delivered"
                      )
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                      orderFilter === f.k
                        ? f.activeCls
                        : `border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 ${f.badgeCls || ""}`
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>

              {/* Select All Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer rounded-xl bg-neutral-100 px-3.5 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-200">
                <input
                  type="checkbox"
                  checked={
                    filteredOrders.length > 0 &&
                    filteredOrders.every((o) => selectedOrderIds.includes(o.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = Array.from(
                        new Set([...selectedOrderIds, ...filteredOrders.map((o) => o.id)])
                      );
                      setSelectedOrderIds(allIds);
                    } else {
                      const currentFilteredIds = new Set(filteredOrders.map((o) => o.id));
                      setSelectedOrderIds(
                        selectedOrderIds.filter((id) => !currentFilteredIds.has(id))
                      );
                    }
                  }}
                  className="h-4 w-4 rounded accent-[#1974E5]"
                />
                <span>Tümünü Seç ({filteredOrders.length})</span>
              </label>
            </div>

            {/* BARKOD OKUYUCU (BARKOD TABANCASI İLE OTOMATİK KARGOYA VERME & TAŞIMA DURUMUNA GEÇİRME) */}
            <div className="rounded-3xl border-2 border-dashed border-[#1974E5]/40 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/90 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1974E5] text-white shadow-xs">
                    <span className="text-xl">🔫</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-neutral-900">
                        Barkod Okutarak Otomatik Kargoya Ver
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        Otomatik &quot;Taşıma Durumu&quot;na Geçirir
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Aras Kargo etiketindeki barkodu tabancayla okutun veya takip kodunu / sipariş numarasını girip Enter&apos;a basın. Sistem sesli onay verip siparişi anında <strong>Kargoda / Taşıma Durumunda</strong> sekmesine taşır.
                    </p>
                  </div>
                </div>

                {/* Quick Test Demo Button */}
                <button
                  type="button"
                  onClick={() => {
                    const candidate =
                      store.orders.find(
                        (o) => o.status === "preparing" || o.status === "pending"
                      ) || store.orders[0];
                    if (candidate) {
                      handleBarcodeScan(
                        candidate.trackingNumber || candidate.orderNumber
                      );
                    } else {
                      notify("Test edilecek sipariş bulunamadı");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                  title="Sistemi test etmek için örnek bir kargo barkodunu okutmuş gibi simüle eder"
                >
                  <span>🧪 Örnek Barkod Okut (Test Et)</span>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBarcodeScan(barcodeInput);
                }}
                className="mt-3.5 flex gap-2"
              >
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">
                    ║▌║▌║
                  </span>
                  <input
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Barkod tabancası ile kargo etiketini okutun veya Aras Kargo takip no / sipariş no girip Enter'a basın..."
                    className="h-11 w-full rounded-xl border-2 border-neutral-300 bg-white pl-11 pr-4 text-xs sm:text-sm font-mono font-bold text-neutral-900 placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400 focus:border-[#1974E5] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#1974E5] px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs hover:bg-[#1461c4]"
                >
                  <span>Okut &amp; Kargoya Ver</span>
                  <span>→</span>
                </button>
              </form>

              {/* Feedback Alert */}
              {barcodeScanFeedback && (
                <div
                  className={`mt-3 flex items-center justify-between rounded-xl p-3.5 text-xs font-bold shadow-xs transition ${
                    barcodeScanFeedback.type === "success"
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border border-rose-300 bg-rose-50 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {barcodeScanFeedback.type === "success" ? "🔊" : "⚠️"}
                    </span>
                    <span>{barcodeScanFeedback.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBarcodeScanFeedback(null)}
                    className="text-neutral-500 hover:text-neutral-800"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* BATCH OPERATIONS ACTION BAR ("Toplu İşlem Yap") */}
            {selectedOrderIds.length > 0 && (
              <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#1974E5] bg-blue-50/95 p-4 shadow-lg backdrop-blur-xs">
                <div className="flex items-center gap-2 font-black text-sm text-[#1974E5]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1974E5] text-xs text-white">
                    {selectedOrderIds.length}
                  </span>
                  <span>Sipariş Seçildi (Toplu İşlem)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Toplu İşleme Al (Bugün Yapılacaklar) */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = structuredClone(store);
                      next.orders.forEach((o) => {
                        if (selectedOrderIds.includes(o.id)) {
                          o.status = "preparing";
                        }
                      });
                      updateStore(next);
                      notify(
                        `✓ Seçili ${selectedOrderIds.length} sipariş işleme alındı! "Bugün Yapılacaklar" listesine eklendi.`
                      );
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
                  >
                    ⚡ Seçilenleri İşleme Al (Bugün Yap) ({selectedOrderIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sel = store.orders.filter((o) =>
                        selectedOrderIds.includes(o.id)
                      );
                      setBatchLabelOrders(sel);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1974E5] px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#1461c4]"
                  >
                    🏷️ Toplu Barkod &amp; Kargo Etiketi Çıkar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sel = store.orders.filter((o) =>
                        selectedOrderIds.includes(o.id)
                      );
                      setBatchInvoiceOrders(sel);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    🧾 Toplu Fatura
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const next = structuredClone(store);
                      next.orders.forEach((o) => {
                        if (selectedOrderIds.includes(o.id)) {
                          o.status = "shipped";
                          o.cargoCompany = "Aras Kargo";
                          if (!o.trackingNumber || !o.trackingNumber.startsWith("418")) {
                            o.trackingNumber =
                              "418" +
                              Math.floor(100000000 + Math.random() * 900000000);
                          }
                        }
                      });
                      updateStore(next);
                      notify(
                        `✓ Seçili ${selectedOrderIds.length} sipariş Aras Kargo takip koduyla Taşıma Durumuna alındı!`
                      );
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    🚚 Toplu Kargoya Ver (Taşıma Durumu)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const next = structuredClone(store);
                      next.orders.forEach((o) => {
                        if (selectedOrderIds.includes(o.id)) {
                          o.status = "delivered";
                        }
                      });
                      updateStore(next);
                      notify(
                        `✓ Seçili ${selectedOrderIds.length} sipariş teslim edildi olarak işaretlendi!`
                      );
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    ✅ Toplu Teslim Edildi Yap
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderIds([])}
                    className="h-9 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                  >
                    ✕ Seçimi Kaldır
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredOrders.map((ord, idx) => {
                const isSelected = selectedOrderIds.includes(ord.id);
                const isScanned = scannedOrderId === ord.id;
                return (
                  <div
                    key={ord.id}
                    className={`rounded-3xl border transition p-5 shadow-2xs ${
                      isScanned
                        ? "border-emerald-500 ring-4 ring-emerald-300/50 bg-emerald-50/20"
                        : isSelected
                        ? "border-[#1974E5] bg-blue-50/20"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds((prev) => [...prev, ord.id]);
                            } else {
                              setSelectedOrderIds((prev) =>
                                prev.filter((id) => id !== ord.id)
                              );
                            }
                          }}
                          className="mt-1 h-5 w-5 rounded accent-[#1974E5] cursor-pointer"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-extrabold text-neutral-900">
                              Sipariş #{ord.orderNumber}
                            </span>
                            <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-neutral-700">
                              Fatura: {ord.invoiceNumber}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {ord.createdAt}
                            </span>

                            {/* Status Badges */}
                            {ord.status === "pending" && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
                                📥 Yeni Sipariş (İşlem Bekliyor)
                              </span>
                            )}
                            {ord.status === "preparing" && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-900">
                                ⚡ İşleme Alındı (Bugün Yapılacak)
                              </span>
                            )}
                            {ord.status === "shipped" && (
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-900">
                                🚚 Kargoda (Taşıma Durumunda)
                              </span>
                            )}
                            {ord.status === "delivered" && (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
                                ✅ Teslim Edildi
                              </span>
                            )}
                            {ord.status === "returned" && (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-900">
                                ↩️ İade
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-neutral-600">
                            <strong>Müşteri:</strong> {ord.customerName} •{" "}
                            {ord.customerPhone} • {ord.address}, {ord.district}/
                            {ord.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click Fast Workflow Progression Buttons */}
                        {ord.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = structuredClone(store);
                              const target = next.orders.find((x) => x.id === ord.id);
                              if (target) {
                                target.status = "preparing";
                                updateStore(next);
                                notify(
                                  `✓ Sipariş #${ord.orderNumber} işleme alındı! "Bugün Yapılacaklar" listesine taşındı.`
                                );
                              }
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-xs font-extrabold text-white shadow-xs hover:bg-amber-600 transition"
                            title="Siparişi işleme al ve bugün yapılacaklara ekle"
                          >
                            <span>⚡ İşleme Al (Bugün Yap)</span>
                          </button>
                        )}

                        {ord.status === "preparing" && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = structuredClone(store);
                              const target = next.orders.find((x) => x.id === ord.id);
                              if (target) {
                                target.status = "shipped";
                                target.cargoCompany = "Aras Kargo";
                                if (
                                  !target.trackingNumber ||
                                  !target.trackingNumber.startsWith("418")
                                ) {
                                  target.trackingNumber =
                                    "418" +
                                    Math.floor(100000000 + Math.random() * 900000000);
                                }
                                updateStore(next);
                                notify(
                                  `✓ Sipariş #${ord.orderNumber} Aras Kargo ile Taşıma Durumuna alındı!`
                                );
                              }
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1974E5] px-3.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#1461c4] transition"
                            title="Siparişi kargoya ver ve taşıma durumuna geçir"
                          >
                            <span>🚚 Kargoya Ver (Taşıma Durumu)</span>
                          </button>
                        )}

                        {ord.status === "shipped" && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = structuredClone(store);
                              const target = next.orders.find((x) => x.id === ord.id);
                              if (target) {
                                target.status = "delivered";
                                updateStore(next);
                                notify(
                                  `✓ Sipariş #${ord.orderNumber} başarıyla teslim edildi!`
                                );
                              }
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700 transition"
                            title="Siparişi teslim edildi olarak işaretle"
                          >
                            <span>✅ Teslim Edildi Yap</span>
                          </button>
                        )}

                        {/* Status dropdown for manual override */}
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
                          className="h-9 rounded-xl border border-neutral-300 bg-white px-2.5 text-xs font-bold"
                        >
                          <option value="pending">📥 Yeni Sipariş</option>
                          <option value="preparing">⚡ İşleme Alındı (Bugün)</option>
                          <option value="shipped">🚚 Kargoda (Taşıma Durumu)</option>
                          <option value="delivered">✅ Teslim Edildi</option>
                          <option value="returned">↩️ İade</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setLabelOrder(ord)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-neutral-900 px-3 text-xs font-bold text-white shadow-2xs hover:bg-neutral-800"
                        >
                          🏷️ Kargo Etiketi
                        </button>

                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(ord)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                        >
                          🧾 Fatura
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
              );
            })}
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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-800">
                        🎬 Ürün Videosu (Telefondan Yükle veya Link Gir)
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1974E5] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1461c4]">
                        📹 Video Seç
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) =>
                            handleVideoFile(e.target.files, (url) =>
                              setPVideo(url)
                            )
                          }
                        />
                      </label>
                    </div>
                    <input
                      value={pVideo}
                      onChange={(e) => setPVideo(e.target.value)}
                      placeholder="https://...mp4 (veya yukarıdaki butondan doğrudan telefon/PC'den video seçin)"
                      className="mt-1 h-10 w-full rounded-xl border border-neutral-300 px-3 text-xs"
                    />
                    {pVideo && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-neutral-300 bg-black">
                        <video
                          controls
                          src={pVideo}
                          className="h-36 w-full object-contain bg-black"
                        />
                        <div className="bg-neutral-900 px-3 py-1 text-center text-[10px] font-semibold text-neutral-300">
                          ▶️ Ürün videosu hazır (oynatıp kontrol edebilirsiniz)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLOR VARIANTS SECTION (Birden Fazla 10+ Renk Seçeneği) */}
                <div className="space-y-3 rounded-2xl border-2 border-dashed border-[#1974E5]/40 bg-blue-50/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">
                        🎨 Ürün Renk Seçenekleri & Varyantlar ({pVariants.length} Renk Eklendi)
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Aynı modelin 10+ farklı deri rengini ekleyebilirsiniz. Müşteri ürün sayfasında tüm renkleri kutucuklar halinde görecektir.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const autoColors: ColorVariant[] = POPULAR_LEATHER_COLORS.map((c, i) => ({
                            id: `var-auto-${Date.now()}-${i}`,
                            name: c.name,
                            colorHex: c.colorHex,
                            image: pImage,
                            stock: 25,
                          }));
                          setPVariants(autoColors);
                          notify("✓ 10 popüler hakiki deri rengi eklendi!");
                        }}
                        className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 shadow-xs"
                      >
                        ⚡ 10 Popüler Rengi Doldur
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newV: ColorVariant = {
                            id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            name: "YENİ RENK",
                            colorHex: "#181818",
                            image: pImage,
                            stock: 20,
                          };
                          setPVariants((prev) => [...prev, newV]);
                        }}
                        className="rounded-xl bg-[#1974E5] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1461c4] shadow-xs"
                      >
                        ＋ Renk Ekle
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Color Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-neutral-500 mr-1">Hızlı Ekle:</span>
                    {POPULAR_LEATHER_COLORS.map((pc) => {
                      const exists = pVariants.some((v) => v.name.toLocaleUpperCase("tr-TR") === pc.name);
                      return (
                        <button
                          key={pc.name}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            const newV: ColorVariant = {
                              id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              name: pc.name,
                              colorHex: pc.colorHex,
                              image: pImage,
                              stock: 25,
                            };
                            setPVariants((prev) => [...prev, newV]);
                            notify(`✓ ${pc.name} eklendi`);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                            exists
                              ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                              : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: pc.colorHex }}
                          />
                          <span>{pc.name}</span>
                          {!exists && <span className="text-neutral-400">+</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* List of Added Colors */}
                  <div className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                    {pVariants.map((v, vIdx) => (
                      <div
                        key={v.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white hover:bg-neutral-50/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-[11px] font-bold text-neutral-700">
                            {vIdx + 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={v.colorHex}
                              onChange={(e) => {
                                const next = [...pVariants];
                                next[vIdx].colorHex = e.target.value;
                                setPVariants(next);
                              }}
                              className="h-8 w-8 cursor-pointer rounded-lg border border-neutral-300 p-0.5"
                              title="Renk Tonunu Değiştir"
                            />
                          </div>

                          <div>
                            <input
                              value={v.name}
                              onChange={(e) => {
                                const next = [...pVariants];
                                next[vIdx].name = e.target.value.toLocaleUpperCase("tr-TR");
                                setPVariants(next);
                              }}
                              placeholder="Renk Adı (Örn: FLOTER SİYAH)"
                              className="h-8 w-36 sm:w-48 rounded-lg border border-neutral-300 px-2.5 text-xs font-bold uppercase text-neutral-900"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={v.image || pImage}
                              alt={v.name}
                              className="h-8 w-8 rounded-lg border border-neutral-200 object-cover"
                            />
                            <label className="cursor-pointer rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100">
                              Fotoğraf
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handlePhotoFile(e.target.files, (url) => {
                                    const next = [...pVariants];
                                    next[vIdx].image = url;
                                    setPVariants(next);
                                  })
                                }
                              />
                            </label>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-neutral-500">Stok:</span>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const next = [...pVariants];
                                next[vIdx].stock = Number(e.target.value) || 0;
                                setPVariants(next);
                              }}
                              className="h-8 w-16 rounded-lg border border-neutral-300 px-2 text-xs font-bold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (pVariants.length <= 1) {
                                notify("⚠️ En az 1 renk varyantı kalmalıdır.");
                                return;
                              }
                              setPVariants(pVariants.filter((_, idx) => idx !== vIdx));
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100"
                            title="Bu Rengi Kaldır"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
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
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <Link
                            href={`/urun/${prod.slug}`}
                            className="inline-block text-xs font-bold text-neutral-700 underline"
                          >
                            Ürün Sayfasında Gör ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingVariantProduct(prod)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 transition shadow-xs"
                          >
                            🎨 Renkleri & Fotoğrafları Yönet ({prod.variants?.length || 0})
                          </button>
                        </div>
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

                      {/* Color Variants Quick Swatches Row */}
                      <div className="col-span-2 sm:col-span-4 mt-1 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-2.5">
                        <span className="text-[11px] font-bold text-neutral-500">
                          Aktif Renkler ({prod.variants?.length || 0}):
                        </span>
                        {(prod.variants || []).map((v) => (
                          <span
                            key={v.id}
                            title={`${v.name} (Stok: ${v.stock})`}
                            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-bold text-neutral-700"
                          >
                            <span
                              className="h-2 w-2 rounded-full border border-black/20"
                              style={{ backgroundColor: v.colorHex }}
                            />
                            <span>{v.name}</span>
                          </span>
                        ))}
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
                  <p className="text-lg font-black uppercase text-red-600">
                    {labelOrder.cargoCompany || "ARAS KARGO"}
                  </p>
                  <p className="text-xs font-bold">
                    Gönderici: {store.settings.companyTitle || "NAZ ÇANTA VE CÜZDAN"}
                  </p>
                  <p className="text-[11px] text-neutral-700">
                    {store.settings.address} • Tel: {store.settings.phone}
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
                  *{labelOrder.trackingNumber || "418290192841"}*
                </p>
                <p className="text-[10px] uppercase font-bold text-neutral-600">
                  ARAS KARGO TAKİP & BARKOD
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
                      <p className="font-mono text-xs font-black text-rose-700 bg-rose-50 p-1 rounded mt-0.5">
                        ⚠️ SICAK BASKI: &ldquo;{it.personalization.customText}&rdquo; ({it.personalization.typeLabel})
                      </p>
                    )}
                    {it.upsells.length > 0 && (
                      <p className="font-bold text-amber-800">
                        [🎁 EK PAKET: {it.upsells.map((u) => u.name).join(", ")}]
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
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="no-print mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900">
                🧾 E-Arşiv Fatura Önizleme ({invoiceOrder.invoiceNumber})
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#1974E5] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#1461c4]"
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

            <div className="rounded-2xl border border-neutral-300 p-6 text-xs text-neutral-800 bg-white">
              <div className="flex justify-between border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-base font-black text-neutral-900">
                    {store.settings.companyTitle || "NAZ ÇANTA VE CÜZDAN"}
                  </p>
                  <p className="text-neutral-600">{store.settings.address}</p>
                  <p className="text-neutral-600">Tel: {store.settings.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">E-ARŞİV FATURA</p>
                  <p className="font-mono font-bold text-neutral-800">
                    No: {invoiceOrder.invoiceNumber}
                  </p>
                  <p className="text-neutral-500">Tarih: {invoiceOrder.createdAt}</p>
                </div>
              </div>

              <div className="my-4">
                <p className="font-bold text-neutral-900">SAYIN: {invoiceOrder.customerName}</p>
                <p className="text-neutral-700">
                  {invoiceOrder.address} — {invoiceOrder.district}/
                  {invoiceOrder.city}
                </p>
                <p className="text-neutral-600">
                  Tel: {invoiceOrder.customerPhone} • E-Posta:{" "}
                  {invoiceOrder.customerEmail}
                </p>
              </div>

              <table className="w-full border-collapse border-t border-b border-neutral-300 text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-800">
                    <th className="py-2">Açıklama</th>
                    <th className="py-2 text-right">Adet</th>
                    <th className="py-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoiceOrder.items.map((item) => (
                    <React.Fragment key={item.cartItemId}>
                      <tr>
                        <td className="py-2 font-bold text-neutral-900">
                          {item.name} ({item.variantName})
                        </td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right font-bold text-neutral-900">
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
                  <div className="flex justify-between text-neutral-600">
                    <span>Ürün Ara Toplam:</span>
                    <span>{formatTRY(invoiceOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Sıcak Baskı Hizmeti:</span>
                    <span>{formatTRY(invoiceOrder.personalizationTotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Hediye Paketi & Ek Ürün:</span>
                    <span>{formatTRY(invoiceOrder.upsellTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-black text-neutral-900">
                    <span>GENEL TOPLAM (KDV Dahil):</span>
                    <span>{formatTRY(invoiceOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* BATCH CARGO LABELS MODAL (Toplu Barkod & Kargo Etiketi) */}
      {/* ===================================================== */}
      {batchLabelOrders && batchLabelOrders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="no-print mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">
                  🏷️ Toplu Aras Kargo Barkod & Etiket Listesi ({batchLabelOrders.length} Sipariş)
                </h3>
                <p className="text-xs text-neutral-500">
                  Tüm etiketler Aras Kargo barkodu ve gönderici olarak NAZ ÇANTA VE CÜZDAN ile hazırlandı.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#1974E5] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#1461c4]"
                >
                  🖨️ Tüm Barkodları Yazdır / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setBatchLabelOrders(null)}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold"
                >
                  ✕ Kapat
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {batchLabelOrders.map((ord, i) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border-2 border-black p-5 text-black bg-white print-page-break"
                >
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div>
                      <p className="text-xl font-black uppercase text-red-600 tracking-wider">
                        {ord.cargoCompany || "ARAS KARGO"}
                      </p>
                      <p className="text-xs font-bold">
                        Gönderici: {store.settings.companyTitle || "NAZ ÇANTA VE CÜZDAN"}
                      </p>
                      <p className="text-[11px] text-neutral-700">
                        {store.settings.address} • Tel: {store.settings.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-base font-black">
                        #{ord.orderNumber}
                      </p>
                      <p className="text-xs">{ord.createdAt}</p>
                      <span className="inline-block mt-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Etiket {i + 1} / {batchLabelOrders.length}
                      </span>
                    </div>
                  </div>

                  {/* Barcode representation */}
                  <div className="my-4 border-b-2 border-black pb-4 text-center">
                    <div className="mx-auto flex h-14 max-w-sm items-center justify-center bg-[repeating-linear-gradient(90deg,#000,#000_3px,#fff_3px,#fff_6px)]" />
                    <p className="mt-1 font-mono text-lg font-black tracking-widest">
                      *{ord.trackingNumber || "418290192841"}*
                    </p>
                    <p className="text-[10px] uppercase font-bold text-neutral-600">
                      ARAS KARGO BARKODU & TAKİP NUMARASI
                    </p>
                  </div>

                  <div className="border-b-2 border-black pb-3 text-xs">
                    <p className="font-black uppercase">ALICI MÜŞTERİ BİLGİLERİ:</p>
                    <p className="mt-1 text-sm font-bold">
                      {ord.customerName} — {ord.customerPhone}
                    </p>
                    <p className="mt-0.5 text-xs">{ord.address}</p>
                    <p className="font-black text-sm">
                      {ord.district} / {ord.city}
                    </p>
                  </div>

                  <div className="pt-3 text-xs">
                    <p className="font-black uppercase">
                      PAKET & ATÖLYE BASKI İÇERİĞİ:
                    </p>
                    {ord.items.map((it) => (
                      <div key={it.cartItemId} className="mt-1.5">
                        <p className="font-bold">
                          • {it.name} ({it.variantName}) × {it.quantity}
                        </p>
                        {it.personalization && (
                          <p className="font-mono text-xs font-black text-rose-700 bg-rose-50 p-1.5 rounded mt-0.5">
                            ⚠️ DİKKAT ATÖLYE SICAK BASKI: &ldquo;{it.personalization.customText}&rdquo; ({it.personalization.typeLabel})
                          </p>
                        )}
                        {it.upsells.length > 0 && (
                          <p className="font-bold text-amber-800">
                            [🎁 EK HEDİYE PAKETİ: {it.upsells.map((u) => u.name).join(", ")}]
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* BATCH INVOICES MODAL (Toplu E-Arşiv Fatura Yazdırma)  */}
      {/* ===================================================== */}
      {batchInvoiceOrders && batchInvoiceOrders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="no-print mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">
                  🧾 Toplu E-Arşiv Fatura Listesi ({batchInvoiceOrders.length} Fatura)
                </h3>
                <p className="text-xs text-neutral-500">
                  Resmi fatura kesici firma: NAZ ÇANTA VE CÜZDAN (Sultanbeyli / İstanbul)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#1974E5] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#1461c4]"
                >
                  🖨️ Tüm Faturaları Yazdır / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setBatchInvoiceOrders(null)}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold"
                >
                  ✕ Kapat
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {batchInvoiceOrders.map((invOrd, i) => (
                <div
                  key={invOrd.id}
                  className="rounded-2xl border border-neutral-300 p-6 text-xs text-neutral-800 bg-white print-page-break"
                >
                  <div className="flex justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <p className="text-base font-black text-neutral-900">
                        {store.settings.companyTitle || "NAZ ÇANTA VE CÜZDAN"}
                      </p>
                      <p className="text-neutral-600">{store.settings.address}</p>
                      <p className="text-neutral-600">Tel: {store.settings.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">E-ARŞİV FATURA</p>
                      <p className="font-mono font-bold text-neutral-800">
                        No: {invOrd.invoiceNumber}
                      </p>
                      <p className="text-neutral-500">Tarih: {invOrd.createdAt}</p>
                    </div>
                  </div>

                  <div className="my-4">
                    <p className="font-bold text-neutral-900">SAYIN: {invOrd.customerName}</p>
                    <p className="text-neutral-700">
                      {invOrd.address} — {invOrd.district}/{invOrd.city}
                    </p>
                    <p className="text-neutral-600">
                      Tel: {invOrd.customerPhone} • E-Posta: {invOrd.customerEmail}
                    </p>
                  </div>

                  <table className="w-full border-collapse border-t border-b border-neutral-300 text-left">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-800">
                        <th className="py-2">Açıklama</th>
                        <th className="py-2 text-right">Adet</th>
                        <th className="py-2 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {invOrd.items.map((item) => (
                        <React.Fragment key={item.cartItemId}>
                          <tr>
                            <td className="py-2 font-bold text-neutral-900">
                              {item.name} ({item.variantName})
                            </td>
                            <td className="py-2 text-right">{item.quantity}</td>
                            <td className="py-2 text-right font-bold text-neutral-900">
                              {formatTRY(item.basePrice * item.quantity)}
                            </td>
                          </tr>
                          {item.personalization && item.personalization.price > 0 && (
                            <tr>
                              <td className="py-1.5 pl-4 text-neutral-600">
                                + {item.personalization.typeLabel} ({item.personalization.customText})
                              </td>
                              <td className="py-1.5 text-right">{item.quantity}</td>
                              <td className="py-1.5 text-right">
                                {formatTRY(item.personalization.price * item.quantity)}
                              </td>
                            </tr>
                          )}
                          {item.upsells.map((u) => (
                            <tr key={u.id}>
                              <td className="py-1.5 pl-4 text-neutral-600">+ {u.name}</td>
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
                      <div className="flex justify-between text-neutral-600">
                        <span>Ürün Ara Toplam:</span>
                        <span>{formatTRY(invOrd.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Sıcak Baskı Hizmeti:</span>
                        <span>{formatTRY(invOrd.personalizationTotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Hediye Paketi & Ek Ürün:</span>
                        <span>{formatTRY(invOrd.upsellTotal)}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-black text-neutral-900">
                        <span>GENEL TOPLAM (KDV Dahil):</span>
                        <span>{formatTRY(invOrd.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* EDIT PRODUCT VARIANTS MODAL (10+ Renk Varyantı Yönetimi) */}
      {/* ===================================================== */}
      {editingVariantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1974E5]">
                  Varyant & Fotoğraf Yönetimi
                </span>
                <h3 className="text-lg font-black text-neutral-900">
                  {editingVariantProduct.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  Aynı modelin 10+ rengini ekleyin. Her rengin fotoğrafı, tonu ve stok adedi ürün sayfasında Getto Deri gibi yan yana kutucuklar olarak sergilenir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingVariantProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Quick presets & Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-blue-50/60 border border-blue-200/60 p-3">
                <div className="text-xs font-bold text-neutral-800">
                  Mevcut Renk Sayısı:{" "}
                  <span className="font-extrabold text-[#1974E5]">
                    {editingVariantProduct.variants?.length || 0} Renk
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentVars = editingVariantProduct.variants || [];
                      const existingNames = new Set(
                        currentVars.map((v) => v.name.toLocaleUpperCase("tr-TR"))
                      );
                      const additions: ColorVariant[] = POPULAR_LEATHER_COLORS.filter(
                        (c) => !existingNames.has(c.name)
                      ).map((c, i) => ({
                        id: `var-edit-${Date.now()}-${i}`,
                        name: c.name,
                        colorHex: c.colorHex,
                        image: editingVariantProduct.image,
                        stock: 25,
                      }));

                      if (additions.length === 0) {
                        notify("Tüm 10 popüler renk zaten bu üründe mevcut!");
                        return;
                      }

                      setEditingVariantProduct({
                        ...editingVariantProduct,
                        variants: [...currentVars, ...additions],
                      });
                      notify(`✓ ${additions.length} yeni renk varyantı listeye eklendi!`);
                    }}
                    className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 shadow-xs"
                  >
                    ⚡ 10 Popüler Deri Rengini Ekle
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newV: ColorVariant = {
                        id: `var-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        name: "YENİ RENK",
                        colorHex: "#181818",
                        image: editingVariantProduct.image,
                        stock: 20,
                      };
                      setEditingVariantProduct({
                        ...editingVariantProduct,
                        variants: [...(editingVariantProduct.variants || []), newV],
                      });
                    }}
                    className="rounded-xl bg-[#1974E5] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1461c4] shadow-xs"
                  >
                    ＋ Yeni Renk Ekle
                  </button>
                </div>
              </div>

              {/* Quick Add Preset Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-500 mr-1">
                  Hızlı Ekle:
                </span>
                {POPULAR_LEATHER_COLORS.map((pc) => {
                  const exists = (editingVariantProduct.variants || []).some(
                    (v) => v.name.toLocaleUpperCase("tr-TR") === pc.name
                  );
                  return (
                    <button
                      key={pc.name}
                      type="button"
                      disabled={exists}
                      onClick={() => {
                        const newV: ColorVariant = {
                          id: `var-quick-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                          name: pc.name,
                          colorHex: pc.colorHex,
                          image: editingVariantProduct.image,
                          stock: 25,
                        };
                        setEditingVariantProduct({
                          ...editingVariantProduct,
                          variants: [...(editingVariantProduct.variants || []), newV],
                        });
                        notify(`✓ ${pc.name} eklendi`);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                        exists
                          ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900 shadow-2xs"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: pc.colorHex }}
                      />
                      <span>{pc.name}</span>
                      {!exists && <span className="text-neutral-400">+</span>}
                    </button>
                  );
                })}
              </div>

              {/* Variants List */}
              <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                {(editingVariantProduct.variants || []).map((v, vIdx) => (
                  <div
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-neutral-50/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-[11px] font-bold text-neutral-700">
                        {vIdx + 1}
                      </span>

                      {/* Color Hex Picker */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={v.colorHex}
                          onChange={(e) => {
                            const nextVars = [...(editingVariantProduct.variants || [])];
                            nextVars[vIdx] = { ...nextVars[vIdx], colorHex: e.target.value };
                            setEditingVariantProduct({
                              ...editingVariantProduct,
                              variants: nextVars,
                            });
                          }}
                          className="h-9 w-9 cursor-pointer rounded-lg border border-neutral-300 p-0.5"
                          title="Renk Tonunu Değiştir"
                        />
                      </div>

                      {/* Variant Name Input */}
                      <div>
                        <input
                          value={v.name}
                          onChange={(e) => {
                            const nextVars = [...(editingVariantProduct.variants || [])];
                            nextVars[vIdx] = {
                              ...nextVars[vIdx],
                              name: e.target.value.toLocaleUpperCase("tr-TR"),
                            };
                            setEditingVariantProduct({
                              ...editingVariantProduct,
                              variants: nextVars,
                            });
                          }}
                          placeholder="Renk Adı (Örn: FLOTER SİYAH)"
                          className="h-9 w-40 sm:w-56 rounded-lg border border-neutral-300 px-3 text-xs font-bold uppercase text-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Variant Photo Preview & Upload */}
                      <div className="flex items-center gap-2">
                        <img
                          src={v.image || editingVariantProduct.image}
                          alt={v.name}
                          className="h-9 w-9 rounded-lg border border-neutral-200 object-cover shadow-2xs"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs">
                          📷 Fotoğraf Seç
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handlePhotoFile(e.target.files, (url) => {
                                const nextVars = [...(editingVariantProduct.variants || [])];
                                nextVars[vIdx] = { ...nextVars[vIdx], image: url };
                                setEditingVariantProduct({
                                  ...editingVariantProduct,
                                  variants: nextVars,
                                });
                                notify(`✓ ${v.name} için fotoğraf güncellendi`);
                              })
                            }
                          />
                        </label>
                      </div>

                      {/* Stock Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-neutral-500">
                          Stok:
                        </span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const nextVars = [...(editingVariantProduct.variants || [])];
                            nextVars[vIdx] = {
                              ...nextVars[vIdx],
                              stock: Number(e.target.value) || 0,
                            };
                            setEditingVariantProduct({
                              ...editingVariantProduct,
                              variants: nextVars,
                            });
                          }}
                          className="h-9 w-20 rounded-lg border border-neutral-300 px-2.5 text-xs font-bold"
                        />
                      </div>

                      {/* Remove Variant Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentVars = editingVariantProduct.variants || [];
                          if (currentVars.length <= 1) {
                            notify("⚠️ En az 1 renk varyantı kalmalıdır.");
                            return;
                          }
                          const nextVars = currentVars.filter((_, idx) => idx !== vIdx);
                          setEditingVariantProduct({
                            ...editingVariantProduct,
                            variants: nextVars,
                          });
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100"
                        title="Bu Rengi Kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <button
                type="button"
                onClick={() => setEditingVariantProduct(null)}
                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = structuredClone(store);
                  const pIdx = next.products.findIndex(
                    (p) => p.id === editingVariantProduct.id
                  );
                  if (pIdx !== -1) {
                    const updatedVariants = editingVariantProduct.variants || [];
                    next.products[pIdx].variants = updatedVariants;
                    // Sync gallery
                    const allImages = [
                      next.products[pIdx].image,
                      ...updatedVariants.map((v) => v.image).filter(Boolean),
                    ];
                    next.products[pIdx].gallery = Array.from(new Set(allImages));
                    updateStore(next);
                    setEditingVariantProduct(null);
                    notify(
                      `✓ ${editingVariantProduct.name} renk seçenekleri başarıyla kaydedildi!`
                    );
                  }
                }}
                className="rounded-xl bg-[#1974E5] px-6 py-2.5 text-xs font-extrabold text-white shadow hover:bg-[#1461c4]"
              >
                💾 Değişiklikleri Kaydet & Yayınla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
