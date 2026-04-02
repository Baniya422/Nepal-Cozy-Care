import type { LucideIcon } from "lucide-react";

export type AccountSection =
  | "overview"
  | "profile"
  | "orders"
  | "addresses"
  | "wishlist"
  | "security"
  | "preferences";

export type AccountUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  line_total?: number;
  plant?: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
};

export type AccountOrder = {
  id: number;
  status: string;
  payment_status?: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  created_at: string;
  items: OrderItem[];
};

export type WishlistEntry = {
  id: number;
  plant_id: number;
  plant?: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
    room?: string | null;
    size?: string | null;
  } | null;
};

export type AddressEntry = {
  id: string;
  label: string;
  address: string;
  note: string;
  isDefault: boolean;
};

export type Preferences = {
  emailUpdates: boolean;
  smsAlerts: boolean;
  careReminderDays: number;
};

export type ProfileExtras = {
  phone: string;
};

export type Notice = {
  tone: "success" | "error";
  text: string;
};

export type SectionConfig = {
  key: AccountSection;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type ProfileForm = {
  name: string;
  email: string;
  phone: string;
};

export type PasswordForm = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type AddressForm = {
  label: string;
  address: string;
  note: string;
};
