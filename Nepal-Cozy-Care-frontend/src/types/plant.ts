export interface PlantReview {
  id: number;
  user_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface Plant {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  survival_guide?: string;
  care_instructions?: string;
  price: number;
  stock?: number;
  category?: string;
  size?: string;
  light?: string;
  water?: string;
  temperature?: string;
  humidity?: string;
  fertilizer?: string;
  difficulty?: string;
  image?: string;
  avg_rating?: number;
  review_count?: number;
  color?: string;
  rooms?: string[] | string;
  is_active?: boolean;
  is_best_seller?: boolean;
  total_sold?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
  reviews?: PlantReview[];
}
