"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, StoreData } from "@/types/store";
import { INITIAL_STORE } from "@/data/initialStore";

const STORE_KEY = "beeblack_store_v1";
const CART_KEY = "beeblack_cart_v1";

interface StoreContextType {
  store: StoreData;
  ready: boolean;
  updateStore: (next: StoreData) => void;
  resetStore: () => void;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "cartItemId">, openDrawer?: boolean) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreData>(INITIAL_STORE);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedStore = localStorage.getItem(STORE_KEY);
      if (savedStore) {
        const parsed = JSON.parse(savedStore);
        if (parsed && Array.isArray(parsed.products)) {
          setStore({
            ...INITIAL_STORE,
            ...parsed,
            settings: {
              ...INITIAL_STORE.settings,
              ...(parsed.settings || {}),
              homeBlocks:
                parsed.settings?.homeBlocks ||
                INITIAL_STORE.settings.homeBlocks,
            },
          });
        }
      }
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch {
      // ignore localStorage errors
    } finally {
      setReady(true);
    }
  }, []);

  const updateStore = (next: StoreData) => {
    setStore(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const resetStore = () => {
    setStore(INITIAL_STORE);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // ignore
    }
  };

  const saveCart = (nextCart: CartItem[]) => {
    setCart(nextCart);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
    } catch {
      // ignore
    }
  };

  const addToCart = (item: Omit<CartItem, "cartItemId">, openDrawer = true) => {
    const newItem: CartItem = {
      ...item,
      cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const next = [newItem, ...cart];
    saveCart(next);
    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    const next = cart
      .map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    saveCart(next);
  };

  const removeFromCart = (cartItemId: string) => {
    saveCart(cart.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => {
    const persPrice =
      (item.personalization?.price || 0) +
      (item.personalization?.symbolPrice || 0);
    const upsellPrice = item.upsells.reduce((uAcc, u) => uAcc + u.price, 0);
    const unitTotal = item.basePrice + persPrice + upsellPrice;
    return acc + unitTotal * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        store,
        ready,
        updateStore,
        resetStore,
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function formatTRY(val: number): string {
  return (
    val.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "TL"
  );
}
