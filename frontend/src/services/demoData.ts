import { 
  FarmerDashboardStats, Farm, WeatherData, FarmTask, Mission, 
  Badge, UserBadge, LeaderboardEntry, GovernmentAuction, CommunityPost,
  RewardItem, DiseaseDiagnosis
} from '../types';

export const DEMO_FARMER_USER = {
  id: 1,
  email: 'farmer@eco.farm',
  full_name: 'Anugrah Sharma',
  display_name: 'EcoFarmer Anugrah',
  location: 'Ludhiana, Punjab',
  phone_number: '+91 9876543210',
  preferred_language: 'English',
  role: 'farmer' as const,
  xp: 450,
  level: 2,
  sustainability_score: 76.0,
  created_at: '2026-05-01T10:00:00Z'
};

export const DEMO_ADMIN_USER = {
  id: 2,
  email: 'admin@eco.farm',
  full_name: 'System Admin',
  display_name: 'EcoFarm Admin',
  location: 'HQ Central',
  phone_number: '+91 9999999999',
  preferred_language: 'English',
  role: 'admin' as const,
  xp: 5000,
  level: 5,
  sustainability_score: 95.0,
  created_at: '2026-01-01T10:00:00Z'
};

export const DEMO_FARMS: Farm[] = [
  {
    id: 1,
    user_id: 1,
    farm_name: 'Green Valley Eco Farm',
    location: 'Ludhiana, Punjab',
    area_acres: 7.5,
    soil_type: 'Loamy',
    irrigation_type: 'Drip Irrigation',
    water_source: 'Canal + Borewell',
    primary_crop: 'Wheat',
    secondary_crops: 'Mustard, Gram',
    farming_experience: '5-10 years',
    current_practices: 'Organic Mulching, Green Manuring, Vermicomposting',
    season: 'Rabi',
    sowing_date: '2026-11-05',
    expected_harvest_date: '2027-04-15',
    farming_goals: 'Zero chemical runoff and 85+ sustainability score',
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  }
];

export const DEMO_STATS: FarmerDashboardStats = {
  user: DEMO_FARMER_USER,
  sustainability_breakdown: {
    overall_score: 76.0,
    water_score: 82.0,
    soil_score: 74.0,
    waste_score: 70.0,
    diversity_score: 78.0,
    resource_score: 76.0
  },
  active_missions_count: 2,
  completed_missions_count: 3,
  total_badges_count: 3,
  recent_recommendations: [
    {
      id: 1,
      user_id: 1,
      farm_id: 1,
      category_id: 1,
      title: 'Automated Drip Scheduling & Soil Moisture Sensor',
      description: 'Your loamy soil retains moisture well. Shift drip intervals to every 4 days based on morning ET rates.',
      reason: 'Current weather indicates low evapotranspiration in Ludhiana district.',
      priority: 'high',
      estimated_impact: 'Save ~25,000 Liters water per acre per cycle',
      difficulty: 'Easy',
      is_read: false,
      created_at: '2026-10-20 09:30'
    },
    {
      id: 2,
      user_id: 1,
      farm_id: 1,
      category_id: 2,
      title: 'Foliar Bio-Stimulant Spray (Jeevamrut)',
      description: 'Spray 200L/acre Jeevamrut microbial solution before next irrigation cycle to boost nitrogen fixation.',
      reason: 'Soil organic carbon reported at 0.65%, optimal target is >0.80%.',
      priority: 'medium',
      estimated_impact: '+15% microbial activity boost',
      difficulty: 'Medium',
      is_read: false,
      created_at: '2026-10-18 14:15'
    }
  ],
  recent_activities: [
    { id: 1, description: 'Completed Mission: Adopt Zero Stubble Burning Protocol', amount: 160, type: 'mission_complete', created_at: '2026-10-19 16:40' },
    { id: 2, description: 'AI Crop Diagnosis: Early Blight (Alternaria solani)', amount: 30, type: 'crop_analysis', created_at: '2026-10-18 11:20' },
    { id: 3, description: 'Community Contribution: Natural Pest Control with Neem Oil', amount: 25, type: 'community_post', created_at: '2026-10-17 19:10' }
  ]
};

export const DEMO_WEATHER: WeatherData = {
  location: 'Ludhiana, Punjab',
  temperature_c: 27.5,
  humidity_percent: 58,
  rain_probability_percent: 5,
  wind_speed_kmh: 8.5,
  condition_text: 'Clear Sky & Optimal Sunlight',
  platform_interpretation: 'Optimal conditions for foliar bio-fertilizer application and weed mulching. Irrigation not required today.',
  forecast: [
    { date: '2026-10-23', max_temp_c: 29, min_temp_c: 18, rain_prob_pct: 0 },
    { date: '2026-10-24', max_temp_c: 28, min_temp_c: 17, rain_prob_pct: 10 },
    { date: '2026-10-25', max_temp_c: 27, min_temp_c: 16, rain_prob_pct: 5 }
  ],
  source: 'OpenMeteo Agricultural API',
  last_updated: '2026-10-22 10:00'
};

export const DEMO_TASKS: FarmTask[] = [
  {
    id: 1,
    farm_id: 1,
    title: 'Clean Drip Irrigation Line Filters',
    description: 'Flush sub-mains and clean sand/disc filters before tomorrow evening cycle',
    category: 'Irrigation',
    due_date: '2026-10-25',
    priority: 'high',
    status: 'pending',
    source: 'system_recommendation'
  },
  {
    id: 2,
    farm_id: 1,
    title: 'Top-Dress Jeevamrut Bio-Formulation',
    description: 'Apply 200 Liters/acre fermented Jeevamrut along irrigation channel',
    category: 'Soil Health',
    due_date: '2026-10-28',
    priority: 'medium',
    status: 'pending',
    source: 'manual'
  }
];

export const DEMO_MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Implement Micro-Irrigation / Drip Scheduling',
    description: 'Switch from surface flooding to pressure-regulated drip tape. Conserve 40% water.',
    category_id: 1,
    difficulty: 'Medium',
    xp_reward: 120,
    duration_days: 5,
    requires_image: true,
    expected_practice_label: 'Drip Irrigation Setup',
    is_active: true,
    created_at: '2026-05-01'
  },
  {
    id: 2,
    title: 'Adopt Zero Stubble Burning Protocol',
    description: 'Incorporate post-harvest wheat/rice stubble into soil using happy seeder or mulcher.',
    category_id: 2,
    difficulty: 'Hard',
    xp_reward: 160,
    duration_days: 7,
    requires_image: true,
    expected_practice_label: 'Stubble Mulching Practice',
    is_active: true,
    created_at: '2026-05-01'
  },
  {
    id: 3,
    title: 'Install Yellow Sticky Traps for Pest Scouting',
    description: 'Place 10 yellow and blue sticky traps per acre to naturally trap aphids and whiteflies.',
    category_id: 3,
    difficulty: 'Easy',
    xp_reward: 80,
    duration_days: 3,
    requires_image: true,
    expected_practice_label: 'Yellow Sticky Traps',
    is_active: true,
    created_at: '2026-05-01'
  }
];

export const DEMO_BADGES: Badge[] = [
  { id: 1, name: 'Sustainability Starter', description: 'Completed first sustainable mission.', icon_name: 'Award', xp_reward: 50, requirement_type: 'mission_count', requirement_value: '1' },
  { id: 2, name: 'Water Saver', description: 'Master of drip irrigation and water budgeting.', icon_name: 'Droplets', xp_reward: 100, requirement_type: 'water_missions', requirement_value: '2' },
  { id: 3, name: 'Soil Protector', description: 'Champion of soil organic carbon and zero-burning.', icon_name: 'Sprout', xp_reward: 100, requirement_type: 'soil_missions', requirement_value: '2' },
  { id: 4, name: 'Climate-Smart Farmer', description: 'Achieved a Sustainability Score of 80+ across metrics.', icon_name: 'Sun', xp_reward: 250, requirement_type: 'score_threshold', requirement_value: '80.0' }
];

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: 101, display_name: 'Gurpreet Singh', level: 4, xp: 1840, sustainability_score: 88.5, badges_count: 6 },
  { rank: 2, user_id: 102, display_name: 'Ramesh Patel', level: 3, xp: 1220, sustainability_score: 82.0, badges_count: 5 },
  { rank: 3, user_id: 1, display_name: 'EcoFarmer Anugrah', level: 2, xp: 450, sustainability_score: 76.0, badges_count: 3 },
  { rank: 4, user_id: 103, display_name: 'Kavita Deshmukh', level: 2, xp: 380, sustainability_score: 71.5, badges_count: 2 },
  { rank: 5, user_id: 104, display_name: 'Manish Verma', level: 1, xp: 210, sustainability_score: 65.0, badges_count: 1 }
];
