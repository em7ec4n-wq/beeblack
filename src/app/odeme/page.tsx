"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore, formatTRY } from "@/components/StoreProvider";

export default function CheckoutPage() {
  const { store, updateStore, cart, clearCart, cartTotal } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "cod" | "bank_transfer"
  >("credit_card");

  const [completedOrderNum, setCompletedOrderNum] = useState("");

  const shippingCost =
    cartTotal >= store.settings.freeShippingThreshold ? 0 : 79.9;
  const codExtra =
    paymentMethod === "cod" ? store.settings.paymentMethods.codFee : 0;
  const grandTotal = cartTotal + shippingCost + codExtra;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderNum = `GTT-${Math.floor(85000 + Math.random() * 9000)}`;
    const invoiceNum = `FTR-202611-${Math.floor(1000 + Math.random() * 8999)}`;
    const trackingNum = `2749${Math.floor(10000000 + Math.random() * 89999999)}`;

    const subtotal = cart.reduce(
      (s, i) => s + i.basePrice * i.quantity,
      0
    );
    const personalizationTotal = cart.reduce(
      (s, i) =>
        s +
        ((i.personalization?.price || 0) +
          (i.personalization?.symbolPrice || 0)) *
          i.quantity,
      0
    );
    const upsellTotal = cart.reduce(
      (s, i) =>
        s +
        i.upsells.reduce((u, x) => u + x.price, 0) * i.quantity,
      0
    );

    const next = structuredClone(store);
    next.orders.unshift({
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
      items: cart,
      subtotal,
      personalizationTotal,
      upsellTotal,
      shippingCost: shippingCost + codExtra,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "credit_card" ? "paid" : "pending",
      status: "preparing",
      cargoCompany: "Aras Kargo",
      trackingNumber: trackingNum,
      customerNote: customerNote.trim() || undefined,
    });

    updateStore(next);
    clearCart();
    setCompletedOrderNum(orderNum);
  };

  if (completedOrderNum) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">
            Siparişiniz Başarıyla Alındı!
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sipariş Numaranız:{" "}
            <strong className="font-mono text-base text-[#1974E5]">
              {completedOrderNum}
            </strong>
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Siparişiniz, seçtiğiniz isim baskısı ve hediye paketi detaylarıyla
            birlikte atölyemize iletildi. Kargo takip numaranız SMS ve e-posta
            ile paylaşılacaktır.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/siparis-takip"
              className="rounded-full bg-[#1974E5] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
            >
              Siparişimi Takip Et
            </Link>
            <Link
              href="/"
              className="rounded-full border border-neutral-300 px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-800"
            >
              Mağazaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        Güvenli Ödeme & Teslimat
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Customer & Payment Form */}
        <form
          onSubmit={handlePlaceOrder}
          className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-7"
        >
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              1. Teslimat ve Fatura Bilgileri
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-neutral-700">
                  Adınız Soyadınız *
                </label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700">
                  Cep Telefonu *
                </label>
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0532 000 00 00"
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700">
                  E-Posta Adresi (E-Arşiv Fatura İçin) *
                </label>
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700">
                    İl *
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700">
                    İlçe *
                  </label>
                  <input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Kadıköy"
                    className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-neutral-700">
                Açık Teslimat Adresi *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Mahalle, Cadde/Sokak, Bina ve Daire No…"
                className="mt-1 w-full rounded-xl border border-neutral-300 p-3 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-neutral-700">
                Sipariş / Hediye Kartı Notunuz (İsteğe Bağlı)
              </label>
              <input
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Hediye paketi içine yazılmasını istediğiniz not…"
                className="mt-1 h-11 w-full rounded-xl border border-neutral-300 px-3.5 text-sm"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-neutral-100 pt-5">
            <h2 className="text-base font-bold text-neutral-900">
              2. Ödeme Yöntemi Seçiniz
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("credit_card")}
                className={`rounded-2xl border-2 p-3.5 text-left transition ${
                  paymentMethod === "credit_card"
                    ? "border-[#1974E5] bg-blue-50/40"
                    : "border-neutral-200"
                }`}
              >
                <p className="text-xs font-extrabold text-neutral-900">
                  💳 Kredi / Banka Kartı
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  3D Secure • 12 Taksit İmkanı
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`rounded-2xl border-2 p-3.5 text-left transition ${
                  paymentMethod === "cod"
                    ? "border-[#1974E5] bg-blue-50/40"
                    : "border-neutral-200"
                }`}
              >
                <p className="text-xs font-extrabold text-neutral-900">
                  📦 Kapıda Ödeme
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  +{formatTRY(store.settings.paymentMethods.codFee)} Hizmet
                  Bedeli
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`rounded-2xl border-2 p-3.5 text-left transition ${
                  paymentMethod === "bank_transfer"
                    ? "border-[#1974E5] bg-blue-50/40"
                    : "border-neutral-200"
                }`}
              >
                <p className="text-xs font-extrabold text-neutral-900">
                  🏦 Havale / FAST
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Anında Onay
                </p>
              </button>
            </div>

            {paymentMethod === "credit_card" && (
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#F6F6F6] p-4 sm:grid-cols-2">
                <input
                  placeholder="Kart Üzerindeki İsim"
                  className="h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm sm:col-span-2"
                />
                <input
                  placeholder="Kart Numarası (4543 •••• •••• ••••)"
                  className="h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm sm:col-span-2"
                />
                <input
                  placeholder="AA / YY"
                  className="h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm"
                />
                <input
                  placeholder="CVV (3 Hane)"
                  className="h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm"
                />
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="mt-4 rounded-2xl bg-[#F6F6F6] p-4 text-xs text-neutral-700">
                <p className="font-bold text-neutral-900">IBAN Bilgimiz:</p>
                <p className="mt-1 font-mono">
                  {store.settings.paymentMethods.bankIban}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#1974E5] text-sm font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[#1461c4] disabled:opacity-50"
          >
            Siparişi Tamamla — {formatTRY(grandTotal)}
          </button>
        </form>

        {/* Right: Detailed Order Summary (Personalization + Gift Pack breakdown) */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-5">
          <h2 className="text-base font-bold text-neutral-900">
            Sipariş Özeti ({cart.length} Kalem)
          </h2>

          <div className="mt-4 space-y-4 divide-y divide-neutral-100">
            {cart.map((item) => (
              <div key={item.cartItemId} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        {item.name} × {item.quantity}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Renk: {item.variantName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">
                    {formatTRY(item.basePrice * item.quantity)}
                  </span>
                </div>

                {item.personalization && (
                  <div className="mt-2 rounded-xl bg-blue-50/70 p-2.5 text-xs">
                    <div className="flex justify-between font-bold text-[#1974E5]">
                      <span>✨ {item.personalization.typeLabel}</span>
                      <span>
                        {item.personalization.price > 0
                          ? `+${formatTRY(
                              item.personalization.price * item.quantity
                            )}`
                          : "Ücretsiz"}
                      </span>
                    </div>
                    {item.personalization.customText && (
                      <p className="mt-0.5 text-neutral-700">
                        İsim: &ldquo;{item.personalization.customText}&rdquo; (
                        {item.personalization.fontFamily})
                      </p>
                    )}
                    {item.personalization.symbolName && (
                      <p className="mt-0.5 text-neutral-700">
                        Sembol: {item.personalization.symbolName} (+
                        {formatTRY(
                          (item.personalization.symbolPrice || 0) *
                            item.quantity
                        )}
                        )
                      </p>
                    )}
                  </div>
                )}

                {item.upsells.length > 0 && (
                  <div className="mt-2 rounded-xl bg-amber-50/80 p-2.5 text-xs">
                    <p className="font-bold text-amber-900">
                      🎁 Hediye Paketi & Ek Ürünler:
                    </p>
                    {item.upsells.map((u) => (
                      <div key={u.id} className="flex justify-between">
                        <span>
                          • {u.name}
                          {u.variant ? ` (${u.variant})` : ""}
                        </span>
                        <span className="font-bold">
                          +{formatTRY(u.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Ürün + Baskı + Hediye Paketi Toplamı</span>
              <span className="font-bold text-neutral-900">
                {formatTRY(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Kargo Ücreti (Aras Kargo)</span>
              <span className="font-bold text-emerald-700">
                {shippingCost === 0 ? "ÜCRETSİZ" : formatTRY(shippingCost)}
              </span>
            </div>
            {codExtra > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Kapıda Ödeme Hizmet Bedeli</span>
                <span className="font-bold">{formatTRY(codExtra)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold text-neutral-900">
              <span>Genel Toplam</span>
              <span className="text-[#1974E5]">{formatTRY(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
