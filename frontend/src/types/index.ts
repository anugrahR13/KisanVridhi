export interface User {
  id: number;
  email: string;
  full_name: string;
  display_name: string;
  location?: string;
  phone_number?: string;
  preferred_language: string;
  role: 'farmer' | 'admin';
  xp: number;
  level: number;
  sustainability_score: number;
  created_at: string;
}

export interface Crop {
  id?: number;
  farm_id?: number;
  crop_name: string;
  variety?: string;
  area_acres?: number;
  planting_date?: string;
  expected_harvest_date?: string;
  status?: string;
}

export interface Farm {
  id: number;
  user_id: number;
  farm_name: string;
  location: string;
  area_acres: number;
  soil_type: string;
  irrigation_type: string;
  water_source: string;
  primary_crop: string;
  secondary_crops?: string;
  farming_experience?: string;
  current_practices?: string;
  season?: string;
  sowing_date?: string;
  expected_harvest_date?: string;
  farming_goals?: string;
  crops?: Crop[];
  created_at: string;
  updated_at: string;
}

export interface PracticeCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category?: PracticeCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp_reward: number;
  duration_days: number;
  requires_image: boolean;
  expected_practice_label?: string;
  is_active: boolean;
  created_at: string;
}

export interface MissionProgress {
  id: number;
  user_id: number;
  farm_id?: number;
  mission_id: number;
  mission?: Mission;
  status: 'started' | 'pending_verification' | 'completed';
  image_url?: string;
  started_at: string;
  completed_at?: string;
}

export interface Recommendation {
  id: number;
  user_id: number;
  farm_id: number;
  category_id: number;
  category?: PracticeCategory;
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimated_impact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  related_mission_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: string;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  awarded_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  level: number;
  xp: number;
  sustainability_score: number;
  badges_count: number;
}

export interface SustainabilityBreakdown {
  overall_score: number;
  water_score: number;
  soil_score: number;
  waste_score: number;
  diversity_score: number;
  resource_score: number;
}

export interface ImageVerification {
  id: number;
  mission_progress_id: number;
  mission_id?: number;
  user_id?: number;
  image_url: string;
  image_path?: string;
  detected_practice: string;
  confidence_score: number;
  status: 'approved' | 'rejected' | 'pending_review';
  verification_status?: 'approved' | 'rejected' | 'pending_review';
  review_notes?: string;
  verified_at: string;
}

export type VerificationRecord = ImageVerification;
export type VerificationStatus = 'approved' | 'rejected' | 'pending_review';

export interface SourceCitation {
  title: string;
  source: string;
  snippet: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  farm_context_used?: string;
}

export interface FarmerDashboardStats {
  user: User;
  sustainability_breakdown: SustainabilityBreakdown;
  active_missions_count: number;
  completed_missions_count: number;
  total_badges_count: number;
  recent_recommendations: Recommendation[];
  recent_activities: Array<{
    id: number;
    description: string;
    amount: number;
    type: string;
    created_at: string;
  }>;
}

export interface AdminStats {
  total_users: number;
  active_farmers: number;
  total_farms: number;
  total_missions: number;
  completed_missions: number;
  avg_sustainability_score: number;
  popular_categories: Array<{ category: string; completed_count: number }>;
  recent_verifications: ImageVerification[];
}

export interface GovernmentAuction {
  id: number;
  title: string;
  crop_type: string;
  msp_price_per_quintal: number;
  min_sustainability_score_required: number;
  location_region: string;
  deadline_date: string;
  procurement_agency: string;
  status: string;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  author_name: string;
  author_level: number;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  created_at: string;
}

export interface DiseaseDiagnosis {
  id: number;
  crop_detected: string;
  disease_name: string;
  confidence_score: number;
  severity: string;
  organic_treatment: string;
  chemical_treatment: string;
  preventive_measure: string;
  recommended_quest?: string;
  image_url?: string;
  expert_escalation_required?: boolean;
  uncertainty_warning?: string;
}

export interface CropTracking {
  id: number;
  crop_name: string;
  variety?: string;
  area_acres?: number;
  planting_date?: string;
  growth_stage: string;
  status: string;
}

export interface HelpDeskTicket {
  id: number;
  ticket_no: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
}

export interface RewardItem {
  id: number;
  title: string;
  description: string;
  category: string;
  points_cost: number;
  sponsor_agency: string;
  image_icon: string;
  inventory_count: number;
  is_active: boolean;
}

export interface UserRewardRedemption {
  id: number;
  reward_id: number;
  reward_title: string;
  points_spent: number;
  voucher_code: string;
  status: string;
  redeemed_at: string;
}

export interface FarmExpense {
  id?: number;
  user_id?: number;
  farm_id: number;
  crop_name?: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
  notes?: string;
  created_at?: string;
}

export interface ProfitRecord {
  id?: number;
  user_id?: number;
  farm_id: number;
  crop_name: string;
  harvest_date: string;
  production_qty_kg: number;
  selling_price_per_kg: number;
  revenue: number;
  total_expenses: number;
  net_profit: number;
  area_acres: number;
  cost_per_acre: number;
  revenue_per_acre: number;
  profit_per_acre: number;
  break_even_price_per_kg: number;
  notes?: string;
  created_at?: string;
}

export interface SoilRecord {
  id?: number;
  user_id?: number;
  farm_id: number;
  ph?: number;
  nitrogen_ppm?: number;
  phosphorus_ppm?: number;
  potassium_ppm?: number;
  organic_carbon_percent?: number;
  soil_type: string;
  moisture_percent?: number;
  tested_at: string;
  notes?: string;
  created_at?: string;
}

export interface FarmTask {
  id: number;
  user_id?: number;
  farm_id?: number;
  title: string;
  description: string;
  category: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  source?: string;
  created_at?: string;
}

export interface ForecastDay {
  date: string;
  max_temp_c: number;
  min_temp_c: number;
  rain_prob_pct: number;
}

export interface WeatherData {
  location: string;
  temperature_c: number;
  humidity_percent: number;
  rain_probability_percent: number;
  wind_speed_kmh: number;
  condition_text: string;
  severe_warning?: string;
  platform_interpretation: string;
  forecast: ForecastDay[];
  source: string;
  last_updated: string;
}

export interface GovernmentScheme {
  id: number;
  title: string;
  state: string;
  applicable_crops: string;
  category: string;
  eligibility: string;
  benefits: string;
  required_documents: string;
  application_process: string;
  official_source_link: string;
  last_verified_date: string;
}

export interface FarmDocument {
  id: number;
  user_id?: number;
  farm_id?: number;
  title: string;
  category: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

export interface MarketPrice {
  id: number;
  market_name: string;
  state: string;
  district: string;
  crop_name: string;
  variety?: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  price_date: string;
  source: string;
  updated_at?: string;
}

