export interface TrainHalt {
  code: string;
  name: string;
  arr: string;
  dep: string;
  halt: string;
  day: number;
}

export interface TrainRecord {
  id: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destStation: string;
  halts: TrainHalt[];
  days: string[];
  classes: string[];
  lastUpdated: string;
  syncStatus: string;
}

export interface Restaurant {
  id: string;
  name: string;
  stationCode: string;
  stationName: string;
  rating: number;
  reviewCount: number;
  minOrder: number;
  prepTime: string;
  vegOnly: boolean;
  fssaiLicense: string;
  image: string;
  address: string;
  isOpen: boolean;
  phone: string;
  cuisines: string[];
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  gstNumber?: string;
  ownerName?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    beneficiaryName?: string;
    bankName?: string;
  };
  kitchenImage?: string;
  createdAt?: string;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  image: string;
  description: string;
  isAvailable: boolean;
  preparationTime: string;
  rating?: number;
  popular?: boolean;
}

export interface SliderBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface OrderPassengerDetails {
  deliveryType: 'train' | 'local';
  passengerName: string;
  mobileNumber: string;
  // Train specific fields
  trainNumber?: string;
  trainName?: string;
  pnrNumber?: string;
  journeyDate?: string;
  boardingStation?: string;
  coachNumber?: string;
  seatNumber?: string;
  // Local delivery specific fields
  localAddress?: string;
  cityArea?: string;
  // Common instructions
  deliveryInstructions?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: OrderPassengerDetails;
  restaurantId: string;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    isVeg: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  gstAmount: number;
  totalAmount: number;
  status: 'Pending WhatsApp Confirmation' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  whatsAppMessage: string;
  notes?: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  logoUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  metaTitle: string;
  metaDescription: string;
  googleAnalyticsId: string;
  lastTrainSync: string;
  lastUpdatedDate: string;
  syncStatus: string;
  fssaiNumber: string;
  address: string;
  announcementText?: string;
  announcementActive?: boolean;
}

export interface CustomerUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  loginMethod: 'phone' | 'google';
  savedPnr?: string;
  createdAt: string;
  token?: string;
}

export interface CustomerRecord {
  id: string;
  phone: string;
  name: string;
  email?: string;
  loginMethod: 'phone' | 'google';
  createdAt: string;
  lastLoginAt: string;
  totalOrders?: number;
}
