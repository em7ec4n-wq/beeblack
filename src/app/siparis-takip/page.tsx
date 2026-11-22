"use client";

import React, { useState } from "react";
import { useStore, formatTRY } from "@/components/StoreProvider";

export default function OrderTrackingPage() {
  const { store } = useStore();
  const [query, setQuery] = useState("GTT-84920");

  const foundOrder = store.orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === query.trim().toLowerCase() ||
      o.trackingNumber.toLowerCase() === query.trim().toLowerCase() ||
      o.customerPhone.includes(query.trim())
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs sm:p-8">
        <h1 className="text-2xl font-extrabold text-neutral-900">
          Sipariş & Kargo Takip
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          Sipariş numaranızı (Örn: GTT-84920) veya kargo takip numaranızı
          girerek kargo durumunu sorgulayabilirsiniz.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sipariş No veya Kargo Takip No girin…"
            className="h-11 flex-1 rounded-xl border border-neutral-300 px-3.5 text-sm font-semibold"
          />
        </div>

        {foundOrder ? (
          <div className="mt-6 space-y-4 rounded-2xl bg-[#F6F6F6] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div>
                <p className="text-xs text-neutral-500">Sipariş No</p>
                <p className="font-mono text-base font-extrabold text-neutral-900">
                  {foundOrder.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Kargo Firması & Takip</p>
                <p className="text-sm font-bold text-[#1974E5]">
                  {foundOrder.cargoCompany} • #{foundOrder.trackingNumber}
                </p>
              </div>
              <span className="rounded-full bg-[#1974E5] px-3 py-1 text-xs font-bold uppercase text-white">
                {foundOrder.status === "preparing"
                  ? "Atölyede / Baskıda"
                  : foundOrder.status === "shipped"
                    ? "Kargoda"
                    : foundOrder.status === "delivered"
                      ? "Teslim Edildi"
                      : "Beklemede"}
              </span>
            </div>

            <div className="text-xs text-neutral-700">
              <p>
                <strong>Alıcı:</strong> {foundOrder.customerName} (
                {foundOrder.city} / {foundOrder.district})
              </p>
              <p className="mt-1">
                <strong>Fatura No:</strong> {foundOrder.invoiceNumber} •{" "}
                <strong>Toplam:</strong> {formatTRY(foundOrder.total)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs font-semibold text-rose-600">
            Bu numaraya ait sipariş bulunamadı. Örnek sipariş no:{" "}
            <button
              type="button"
              onClick={() => setQuery("GTT-84920")}
              className="underline"
            >
              GTT-84920
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
