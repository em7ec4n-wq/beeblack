export interface ColorVariant {
  id: string;
  name: string;
  colorHex: string;
  image: string;
  gallery?: string[];
  stock: number;
}

export interface ProductSpec {
  icon: "height" | "width" | "depth" | "carry" | "card" | "cash" | "zip" | "leather";
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  photoUrl?: string;
  stampChoice?: string;
  published: boolean;
}

export interface UpsellOption {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  variants?: string[];
  defaultVariant?: string;
  isGiftWrap?: boolean;
  active: boolean;
}

export interface StampSymbol {
  id: string;
  name: string;
  category: string;
  price: number;
  iconText: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  videoUrl?: string;
  variants: ColorVariant[];
  specs: ProductSpec[];
  description: string;
  materialNote: string;
  deliveryEstimate: string;
  personalizationEnabled: boolean;
  laserPrintFree: boolean;
  hotStampPrice: number;
  published: boolean;
  featured: boolean;
  isNewSeason?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  showOnHome: boolean;
  parentSlug?: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  variantName: string;
  basePrice: number;
  quantity: number;
  personalization?: {
    type: "none" | "laser" | "hot_stamp";
    typeLabel: string;
    price: number;
    customText: string;
    fontFamily: string;
    foilColor?: string;
    symbolName?: string;
    symbolPrice?: number;
  };
  upsells: {
    id: string;
    name: string;
    variant?: string;
    price: number;
    image: string;
  }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  district: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  personalizationTotal: number;
  upsellTotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: "credit_card" | "cod" | "bank_transfer";
  paymentStatus: "paid" | "pending" | "refunded";
  status: "pending" | "preparing" | "shipped" | "delivered" | "returned";
  cargoCompany: "DHL eCommerce" | "Yurtiçi Kargo" | "Aras Kargo" | "MNG Kargo";
  trackingNumber: string;
  customerNote?: string;
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  reason: string;
  hasPersonalization: boolean;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "completed";
  refundAmount: number;
  adminNote?: string;
}

export interface CustomerQuestion {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  question: string;
  answer?: string;
  createdAt: string;
  status: "unanswered" | "answered";
  isPublic: boolean;
}

export interface StoreSettings {
  brandName: string;
  slogan: string;
  announcements: string[];
  freeShippingThreshold: number;
  defaultHotStampPrice: number;
  defaultGiftPackagePrice: number;
  premiumGiftPackagePrice: number;
  supportHours: string;
  phone: string;
  whatsapp: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage: string;
  promoVideoUrl: string;
  paymentMethods: {
    creditCardActive: boolean;
    posProvider: string;
    installmentUpTo: number;
    codActive: boolean;
    codFee: number;
    bankTransferActive: boolean;
    bankIban: string;
  };
}

export interface StoreData {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  upsells: UpsellOption[];
  symbols: StampSymbol[];
  reviews: ProductReview[];
  orders: Order[];
  returns: ReturnRequest[];
  questions: CustomerQuestion[];
}
