export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  is_premium: boolean;
  image_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  stripe_custer_id?: string; // Legacy
  paddle_customer_id?: string;
}

export interface Subscription {
  subscription_id: string;
  subscription_status: string;
  price_id: string;
  product_id: string;
  scheduled_change: string | null;
  customer_id: string;
  cancel_url: string | null;
  update_url: string | null;
  customer_token: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export interface StatItem {
  value: string;
  label: string;
}

declare global {
  interface Window {
    Paddle: any;
  }
}