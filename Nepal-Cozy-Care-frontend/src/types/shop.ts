export interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  short_description: string | null;
  description: string | null;
  establishment_year: number | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  website?: string | null;
  social_links?: Record<string, string> | null;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  is_verified: boolean;
  approved_at?: string | null;
  approved_by?: number | null;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  plants_count?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SellerStats {
  total_products: number;
  active_products: number;
  pending_products: number;
  low_stock_products: number;
  total_orders: number;
  total_sales: number;
}
