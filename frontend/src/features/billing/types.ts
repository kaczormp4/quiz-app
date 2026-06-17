export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  description: string;
  price_amount: number;
  currency: string;
  billing_period: string;
  features: string[];

  max_difficulty: string;
  can_answer_questions: boolean;
  can_view_explanations: boolean;
  can_use_review: boolean;
  can_submit_questions: boolean;
  has_unlimited_questions: boolean;

  is_active: boolean;
  sort_order: number;
};

export type BillingSubscription = {
  id: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  plan: BillingPlan;
};

export type BillingStatus = {
  is_pro: boolean;
  access_status: string;
  current_plan: BillingPlan | null;
  active_subscription: BillingSubscription | null;
  subscription_expires_at: string | null;
  next_payment_at: string | null;
  days_left: number | null;
  should_show_renewal_warning: boolean;
};

export type CheckoutResponse = {
  checkout_url: string | null;
  provider: string;
  message: string;
  plan: BillingPlan;
};
