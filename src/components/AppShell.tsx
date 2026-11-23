"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, formatTRY } from "@/components/StoreProvider";
import { TridentLogo } from "@/components/Icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/yonetim");

  const {
    store,
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSpun, setWheelSpun] = useState(false);
  const [wheelPrize, setWheelPrize] = useState("");

  if (isAdmin) {
    return <>{children}</>;
  }

  const searchResults =
    searchQuery.trim().length > 1
      ? store.products.filter(
          (p) =>
            p.published &&
            `${p.name} ${p.sku} ${p.description}`
              .toLocaleLowerCase("tr-TR")
              .includes(searchQuery.trim().toLocaleLowerCase("tr-TR"))
        )
      : [];

  const remainingForFreeShipping = Math.max(
    0,
    store.settings.freeShippingThreshold - cartTotal
  );
  const freeShippingProgress = Math.min(
    100,
    (cartTotal / store.settings.freeShippingThreshold) * 100
  );

  const handleSpinWheel = (e: React.FormEvent) => {
    e.preventDefault();
    const prizes = [
      "BEEBLACK200 (200 TL İndirim!)",
      "KARGO100 (Ücretsiz Kargo & Hediye Paketi)",
      "BEEBLACK10 (%10 Hoş Geldin İndirimi)",
    ];
    setWheelPrize(prizes[Math.floor(Math.random() * prizes.length)]);
    setWheelSpun(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F6F6] text-[#171717]">
      {/* 1. ANNOUNCEMENT BAR MARQUEE */}
      <div
        aria-label="Duyuru çubuğu"
        className="overflow-hidden border-b border-neutral-200 bg-white py-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-900 sm:text-xs"
      >
        <div className="flex animate-marquee items-center gap-8 whitespace-nowrap px-4">
          {[...store.settings.announcements, ...store.settings.announcements].map(
            (text, i) => (
              <span key={i} className="inline-flex items-center gap-6">
                <span className="underline decoration-[#D60000] decoration-2 underline-offset-4">
                  {text}
                </span>
                <span className="text-neutral-400">•</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* 2. STICKY 3-PART HEADER (Compact & Clean) */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-[74px] sm:px-8">
          {/* Left: Hamburger Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Site navigasyonu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="16" y2="12" />
                <line x1="3" y1="17" x2="12" y2="17" />
              </svg>
            </button>
          </div>

          {/* Center: Prominent BeeBlack Bee-Only Logo */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center text-neutral-900 transition hover:opacity-85 py-1"
          >
            <TridentLogo className="h-14 sm:h-16 md:h-20 w-auto" />
          </Link>

          {/* Right: Search & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Ara"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                searchOpen
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.2" y2="16.2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Sepeti görüntüle"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M6 7h12l1 13H5L6 7z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1974E5] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SLIM SEARCH BAR RIGHT UNDER THE STICKY HEADER (No backdrop blur, no screen cover!) */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full z-40 border-b border-neutral-200 bg-white px-4 py-2.5 shadow-md">
            <div className="mx-auto max-w-xl">
              <div className="relative flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.2" y2="16.2" />
                </svg>
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara (Örn: Dors çanta, Drax cüzdan)…"
                  className="h-9 w-full rounded-full bg-[#F3F4F6] pl-9 pr-9 text-xs text-neutral-900 focus:bg-neutral-100 focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  aria-label="Aramayı kapat"
                  className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
                >
                  ✕
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-60 divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-100 bg-white">
                  {searchResults.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/urun/${item.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between gap-3 p-2 transition hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {item.sku}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#1974E5]">
                        {formatTRY(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. LEFT NAVIGATION DRAWER (13 ITEMS LIKE GETTO DERI) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[340px] max-w-[88vw] flex-col justify-between bg-white p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Kapalı"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 hover:bg-neutral-100"
                >
                  ✕
                </button>
                <TridentLogo className="h-9 w-auto" />
                <div className="w-10" />
              </div>

              <nav className="mt-5 max-h-[68vh] overflow-y-auto pr-1">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold tracking-wide text-neutral-900 hover:bg-neutral-100"
                    >
                      <span>ANA SAYFA</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/kategori/hediye-set-kutulari"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold tracking-wide text-neutral-900 hover:bg-neutral-100"
                    >
                      <span>YILBAŞI ❄️</span>
                    </Link>
                  </li>
                  {store.categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/kategori/${cat.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold tracking-wide text-neutral-900 hover:bg-neutral-100"
                      >
                        <span>{cat.name}</span>
                        <span className="text-neutral-400">→</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/urun/dors-hakiki-deri-el-cantasi"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-3 text-sm font-bold tracking-wide text-[#D60000]"
                    >
                      <span>İNDİRİM FIRSATI! (%20)</span>
                      <span>🔥</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="space-y-2.5 border-t border-neutral-100 pt-4">
              <Link
                href="/siparis-takip"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#1974E5] text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#1461c4]"
              >
                Sipariş & Kargo Takip
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* 4. CART DRAWER (Showing Sıcak Baskı, Lazer Baskı, Hediye Paketi Upsells clearly!) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setCartOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[430px] max-w-[94vw] flex-col justify-between bg-white shadow-2xl">
            {/* Cart Header */}
            <div className="border-b border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">
                  Sepetim ({cartCount})
                </h2>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-700 hover:bg-neutral-200"
                >
                  ✕
                </button>
              </div>

              {/* Free Shipping Progress Bar */}
              <div className="mt-3 rounded-xl bg-[#F6F6F6] p-3">
                <p className="text-xs font-semibold text-neutral-800">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      Ücretsiz kargo için{" "}
                      <span className="font-bold text-[#1974E5]">
                        {formatTRY(remainingForFreeShipping)}
                      </span>{" "}
                      daha ekleyin!
                    </>
                  ) : (
                    <span className="text-emerald-700">
                      🎉 Tebrikler! Siparişinizde{" "}
                      <strong>ÜCRETSİZ KARGO</strong> kazandınız.
                    </span>
                  )}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-[#1974E5] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-base font-bold text-neutral-800">
                    Sepetiniz şu an boş
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Kişiye özel sıcak baskılı deri çanta ve cüzdanlarımızı keşfedin.
                  </p>
                  <Link
                    href="/urun/dors-hakiki-deri-el-cantasi"
                    onClick={() => setCartOpen(false)}
                    className="mt-4 rounded-full bg-[#1974E5] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
                  >
                    Dors El Çantasını İncele
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const persPrice =
                      (item.personalization?.price || 0) +
                      (item.personalization?.symbolPrice || 0);
                    const upsellPrice = item.upsells.reduce(
                      (s, u) => s + u.price,
                      0
                    );
                    const unitPrice = item.basePrice + persPrice + upsellPrice;

                    return (
                      <div
                        key={item.cartItemId}
                        className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-3.5"
                      >
                        <div className="flex gap-3.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 shrink-0 rounded-xl border border-neutral-200 object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/urun/${item.slug}`}
                                onClick={() => setCartOpen(false)}
                                className="text-sm font-bold text-neutral-900 hover:text-[#1974E5]"
                              >
                                {item.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="text-xs font-semibold text-neutral-400 hover:text-rose-600"
                              >
                                Sil
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold text-neutral-600">
                              Renk: {item.variantName}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              Ürün Fiyatı: {formatTRY(item.basePrice)}
                            </p>
                          </div>
                        </div>

                        {/* Personalization Badge in Cart */}
                        {item.personalization &&
                          item.personalization.type !== "none" && (
                            <div className="mt-3 rounded-xl border border-[#1974E5]/25 bg-blue-50/60 p-2.5 text-xs">
                              <div className="flex items-center justify-between font-bold text-neutral-900">
                                <span>
                                  ✨ {item.personalization.typeLabel}
                                </span>
                                <span
                                  className={
                                    item.personalization.price > 0
                                      ? "text-emerald-700"
                                      : "text-emerald-600"
                                  }
                                >
                                  {item.personalization.price > 0
                                    ? `+${formatTRY(item.personalization.price)}`
                                    : "Ücretsiz"}
                                </span>
                              </div>
                              {item.personalization.customText && (
                                <p className="mt-1 text-neutral-700">
                                  Yazılacak İsim:{" "}
                                  <strong className="font-mono text-neutral-900">
                                    &ldquo;{item.personalization.customText}&rdquo;
                                  </strong>{" "}
                                  ({item.personalization.fontFamily}
                                  {item.personalization.foilColor
                                    ? ` • ${item.personalization.foilColor}`
                                    : ""}
                                  )
                                </p>
                              )}
                              {item.personalization.symbolName && (
                                <p className="mt-0.5 text-neutral-700">
                                  Hazır Logo:{" "}
                                  <strong>
                                    {item.personalization.symbolName}
                                  </strong>{" "}
                                  (+{formatTRY(item.personalization.symbolPrice || 0)})
                                </p>
                              )}
                            </div>
                          )}

                        {/* Gift Package & Upsell Badges in Cart */}
                        {item.upsells.length > 0 && (
                          <div className="mt-2 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs">
                            <p className="font-bold text-amber-950">
                              🎁 Seçilen Hediye Paketi & Ek Ürünler:
                            </p>
                            {item.upsells.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center justify-between text-neutral-800"
                              >
                                <span>
                                  • {u.name}
                                  {u.variant ? ` (${u.variant})` : ""}
                                </span>
                                <span className="font-bold text-neutral-900">
                                  +{formatTRY(u.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quantity & Subtotal */}
                        <div className="mt-3 flex items-center justify-between border-t border-neutral-200/80 pt-2.5">
                          <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.cartItemId, -1)
                              }
                              className="h-7 w-8 text-sm font-bold text-neutral-700 hover:text-black"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.cartItemId, 1)
                              }
                              className="h-7 w-8 text-sm font-bold text-neutral-700 hover:text-black"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-neutral-500">
                              Toplam:{" "}
                            </span>
                            <span className="text-sm font-extrabold text-neutral-900">
                              {formatTRY(unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-neutral-600">
                    Ara Toplam (Baskı & Paket Dahil)
                  </span>
                  <span className="text-lg font-extrabold text-neutral-900">
                    {formatTRY(cartTotal)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Kargo ve vergiler ödeme adımında hesaplanır.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Link
                    href="/odeme"
                    onClick={() => setCartOpen(false)}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-[#1974E5] text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1461c4]"
                  >
                    Güvenli Ödemeye Geç — {formatTRY(cartTotal)}
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* MAIN PAGE CONTENT */}
      <main className="flex-1">{children}</main>

      {/* 5. TRUST BAR + ROUNDED DARK FOOTER (#171717) */}
      <section className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-neutral-900">
              Müşteri Hizmetleri
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
              Sizlere daha iyi hizmet verebilmek amacıyla{" "}
              {store.settings.supportHours} arasında müşteri hizmetlerimiz
              aktiftir.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-neutral-900">
              Hızlı ve Güvenli Kargo
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
              {store.settings.freeShippingThreshold}₺ ve üzeri siparişlerinizde
              Aras Kargo ile ücretsiz teslimat.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-neutral-900">
              Güvenli Ödeme
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
              256-Bit SSL ve 3D Secure güvenli ödeme altyapımızla ödemeleriniz
              her daim bizimle güvendedir.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-8 rounded-t-[32px] bg-[#171717] px-4 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 text-white">
                <TridentLogo className="h-11 w-auto" invert />
                <span className="font-heading text-lg font-extrabold tracking-widest">
                  BEEBLACK
                </span>
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                {store.settings.slogan}. %100 el işçiliği hakiki deri çanta,
                cüzdan ve kişiye özel sıcak baskı tasarımları.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                KATEGORİLER
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                {store.categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/kategori/${c.slug}`}
                      className="hover:text-white"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                YASAL BİLGİLER
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li>Mesafeli Satış Sözleşmesi</li>
                <li>Kişisel Verileri Koruma Kanunu (KVKK)</li>
                <li>İade ve Değişim Koşulları</li>
                <li>Gizlilik ve Çerez Politikası</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                SİPARİŞ BİLGİLERİ
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li>
                  <Link href="/siparis-takip" className="hover:text-white">
                    Sipariş & Kargo Takip
                  </Link>
                </li>
                <li>Kargo & Teslimat</li>
                <li>İsim Baskısı & Garanti Destek</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                İLETİŞİM & MAĞAZA
              </h4>
              <p className="mt-3 text-xs text-neutral-400">
                {store.settings.address}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Destek: {store.settings.phone}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
            <p>© 2026 {store.settings.brandName}. Tüm hakları saklıdır.</p>
            <p>E-Ticaret & Özel Kişiselleştirme Altyapısı</p>
          </div>
        </div>
      </footer>

      {/* 6. FLOATING "ÇARKI ÇEVİR" VERTICAL TAB (Right Edge, exactly like Getto Deri!) + CHAT BUTTON */}
      <div className="fixed right-0 top-1/2 z-30 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setWheelOpen(true)}
          className="flex flex-col items-center gap-2 rounded-l-xl bg-[#222222] px-2.5 py-4 text-xs font-semibold tracking-wide text-white shadow-lg transition hover:bg-black"
        >
          <span className="[writing-mode:vertical-rl] rotate-180">
            Çarkı çevir
          </span>
          <span className="text-sm">🎁</span>
        </button>
      </div>

      <Link
        href="/urun/dors-hakiki-deri-el-cantasi#soru-sor"
        aria-label="BeeBlack sohbetini aç"
        className="fixed bottom-5 right-5 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-[#171717] text-white shadow-xl transition hover:scale-105"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </Link>

      {/* SPIN TO WIN MODAL */}
      {wheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setWheelOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-extrabold text-neutral-900">
              BeeBlack&apos;te Şansını Çevir! 🎡
            </h3>
            <p className="mt-1 text-xs text-neutral-600">
              E-posta adresini bırak, çarkı çevir ve sana çıkan indirim kodunu
              anında kullan.
            </p>
            {!wheelSpun ? (
              <form onSubmit={handleSpinWheel} className="mt-4 space-y-3">
                <input
                  required
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Telefon numaranız"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
                />
                <button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#1974E5] text-sm font-bold text-white"
                >
                  Şansımı Dene
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-xs font-semibold text-emerald-700">
                  TEBRİKLER! KAZANDIĞINIZ FIRSAT:
                </p>
                <p className="mt-1 text-lg font-extrabold text-emerald-950">
                  {wheelPrize}
                </p>
                <button
                  type="button"
                  onClick={() => setWheelOpen(false)}
                  className="mt-4 rounded-full bg-[#1974E5] px-6 py-2 text-xs font-bold text-white"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
