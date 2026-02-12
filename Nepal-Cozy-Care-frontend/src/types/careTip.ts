export interface CareTip {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  category: 'watering' | 'fertilizing' | 'pest_control' | 'indoor' | 'outdoor' | 'seasonal';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  plant_ids?: number[];
  views_count: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
  };
}

export interface CareTipFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  plant_id?: number;
  sort_by?: 'newest' | 'oldest' | 'popular';
}

export interface CareTipCategories {
  [key: string]: string;
}

export interface CareTipResponse {
  message: string | null;
  data: {
    current_page: number;
    data: CareTip[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CareTipDetailResponse {
  message: string | null;
  data: {
    tip: CareTip;
    related_tips: CareTip[];
  };
}
