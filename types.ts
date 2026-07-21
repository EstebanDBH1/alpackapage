export type AiTool = 'cualquier-modelo' | 'chatgpt' | 'claude' | 'gemini';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  // Solo llega en el detalle (get_prompt_detail); el listado ligero no lo incluye
  content?: string;
  category: string;
  is_premium: boolean;
  image_url?: string;
  created_at: string;
  ai_tool: AiTool;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
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

export interface FaqItem {
  question: string;
  answer: string;
}
