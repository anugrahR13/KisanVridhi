import { 
  FarmerDashboardStats, Farm, WeatherData, FarmTask, Mission, 
  Badge, UserBadge, LeaderboardEntry, GovernmentAuction, CommunityPost,
  RewardItem, DiseaseDiagnosis
} from '../types';

export const DEMO_GURPREET_USER = {
  id: 5,
  email: 'gurpreet@eco.farm',
  full_name: 'Gurpreet Singh',
  display_name: 'EcoFarmer Gurpreet',
  location: 'Ludhiana, Punjab, India',
  phone_number: '+91 98765 01234',
  preferred_language: 'English',
  role: 'farmer' as const,
  xp: 1250,
  level: 3,
  sustainability_score: 84.5,
  created_at: '2026-05-01T10:00:00Z'
};

export const DEMO_FARMER_USER = DEMO_GURPREET_USER;

export const DEMO_ADMIN_USER = {
  id: 1,
  email: 'admin@eco.farm',
  full_name: 'System Admin',
  display_name: 'EcoFarm Admin',
  location: 'HQ Central',
  phone_number: '+91 99999 99999',
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
    user_id: 5,
    farm_name: 'Amrit Sarovar Eco Farm',
    location: 'Ludhiana, Punjab',
    area_acres: 5.5,
    soil_type: 'Loamy',
    irrigation_type: 'Drip Irrigation',
    water_source: 'Borewell + Rainwater Harvesting',
    primary_crop: 'Wheat',
    secondary_crops: 'Mustard, Gram, Vegetables',
    farming_experience: '5-10 years',
    current_practices: 'Organic Mulching, Green Manuring, Vermicomposting, Drip Scheduling',
    season: 'Rabi',
    sowing_date: '2026-11-05',
    expected_harvest_date: '2027-04-15',
    farming_goals: 'Zero chemical runoff, solar micro-irrigation, and 85+ sustainability score',
    crops: [
      { id: 1, farm_id: 1, crop_name: 'Wheat', variety: 'HD-3086', area_acres: 3.5, status: 'active' },
      { id: 2, farm_id: 1, crop_name: 'Mustard', variety: 'Pusa Bold', area_acres: 1.5, status: 'active' },
      { id: 3, farm_id: 1, crop_name: 'Gram (Chickpea)', variety: 'Pusa 362', area_acres: 0.5, status: 'active' }
    ],
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 2,
    user_id: 5,
    farm_name: 'Shivalik Organic Orchard & Pulses',
    location: 'Rupnagar, Punjab',
    area_acres: 2.5,
    soil_type: 'Alluvial',
    irrigation_type: 'Sprinkler',
    water_source: 'Canal + Pond',
    primary_crop: 'Kinnow Mandarin',
    secondary_crops: 'Chickpea, Moong',
    farming_experience: '10+ years',
    current_practices: 'Intercropping, Bio-stimulants, Bio-pesticides',
    season: 'Zaid',
    crops: [
      { id: 4, farm_id: 2, crop_name: 'Kinnow Mandarin', variety: 'Punjab Kinnow', area_acres: 2.0, status: 'active' },
      { id: 5, farm_id: 2, crop_name: 'Summer Moong', variety: 'SML-668', area_acres: 0.5, status: 'active' }
    ],
    created_at: '2026-06-15T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  }
];

export const DEMO_STATS: FarmerDashboardStats = {
  user: DEMO_GURPREET_USER,
  sustainability_breakdown: {
    overall_score: 84.5,
    water_score: 88.0,
    soil_score: 86.0,
    waste_score: 82.0,
    diversity_score: 80.0,
    resource_score: 86.5
  },
  active_missions_count: 1,
  completed_missions_count: 2,
  total_badges_count: 5,
  recent_recommendations: [
    {
      id: 1,
      user_id: 5,
      farm_id: 1,
      category_id: 1,
      title: 'Automated Drip Scheduling & Soil Moisture Sensor',
      description: 'Your loamy soil retains moisture well. Shift drip intervals to every 4 days based on morning ET rates.',
      reason: 'Current weather indicates low evapotranspiration in Ludhiana district.',
      priority: 'high',
      estimated_impact: 'Save ~28,000 Liters water per acre per cycle',
      difficulty: 'Easy',
      is_read: false,
      created_at: '2026-10-20 09:30'
    },
    {
      id: 2,
      user_id: 5,
      farm_id: 1,
      category_id: 2,
      title: 'Foliar Bio-Stimulant Spray (Jeevamrut)',
      description: 'Spray 200L/acre Jeevamrut microbial solution before next irrigation cycle to boost nitrogen fixation.',
      reason: 'Soil organic carbon reported at 0.78%, target is maintaining >0.80%.',
      priority: 'medium',
      estimated_impact: '+18% microbial activity boost',
      difficulty: 'Medium',
      is_read: false,
      created_at: '2026-10-18 14:15'
    }
  ],
  recent_activities: [
    { id: 1, description: 'Harvest Profit Logged: ₹97,120 net profit from 54 quintals HD-3086 Wheat', amount: 200, type: 'profit_ledger', created_at: '2026-10-22 11:30' },
    { id: 2, description: 'Completed Mission: Implement Micro-Irrigation Drip Scheduling (Verified)', amount: 100, type: 'mission_complete', created_at: '2026-10-20 16:40' },
    { id: 3, description: 'Foliar AI Diagnosis: Wheat Yellow Rust (Puccinia striiformis, 94.6% match)', amount: 40, type: 'crop_analysis', created_at: '2026-10-18 11:20' },
    { id: 4, description: 'Community Contribution: 50% Water Savings using Sub-Surface Drip in Ludhiana', amount: 35, type: 'community_post', created_at: '2026-10-17 19:10' }
  ]
};

export const DEMO_WEATHER: WeatherData = {
  location: 'Ludhiana, Punjab',
  temperature_c: 27.5,
  humidity_percent: 58,
  rain_probability_percent: 5,
  wind_speed_kmh: 8.5,
  condition_text: 'Clear Sky & Optimal Sunlight',
  platform_interpretation: 'Optimal conditions for foliar bio-fertilizer application and weed mulching. Rain probability low; schedule drip irrigation.',
  source: 'Open-Meteo & IMD Agri Forecast',
  last_updated: '2026-10-29 18:00',
  forecast: [
    { date: '2026-10-29', max_temp_c: 29, min_temp_c: 18, rain_prob_pct: 5 },
    { date: '2026-10-30', max_temp_c: 28, min_temp_c: 17, rain_prob_pct: 10 },
    { date: '2026-10-31', max_temp_c: 28, min_temp_c: 16, rain_prob_pct: 15 },
    { date: '2026-11-01', max_temp_c: 27, min_temp_c: 16, rain_prob_pct: 5 },
    { date: '2026-11-02', max_temp_c: 27, min_temp_c: 15, rain_prob_pct: 0 }
  ]
};

export const DEMO_TASKS: FarmTask[] = [
  {
    id: 1,
    user_id: 5,
    farm_id: 1,
    title: 'Inspect Wheat Lower Leaves for Yellow Rust',
    description: 'Walk through 5.5 acre field and inspect foliage using AI Grad-CAM foliar tool.',
    category: 'Pest Control',
    due_date: '2026-11-04',
    priority: 'high',
    status: 'pending',
    source: 'AI System',
    created_at: '2026-10-20'
  },
  {
    id: 2,
    user_id: 5,
    farm_id: 1,
    title: 'Flush Solar Drip Irrigation Laterals at 2.2 Bar',
    description: 'Open flush caps on 8 sub-surface laterals and flush silt accumulated from borewell.',
    category: 'Irrigation',
    due_date: '2026-11-06',
    priority: 'medium',
    status: 'pending',
    source: 'Manual',
    created_at: '2026-10-20'
  },
  {
    id: 3,
    user_id: 5,
    farm_id: 1,
    title: 'Apply Fermented Jeevamrut Liquid via Venturi Injector',
    description: 'Inject 200L of 7-day fermented Jeevamrut during scheduled evening irrigation.',
    category: 'Organic Farming',
    due_date: '2026-11-08',
    priority: 'medium',
    status: 'pending',
    source: 'Recommendation',
    created_at: '2026-10-20'
  },
  {
    id: 4,
    user_id: 5,
    farm_id: 1,
    title: 'Broadcasting 2nd Split Neem-Coated Urea (Tillering Stage)',
    description: 'Apply 1.2 bags (55 kg) urea per acre ahead of light drip watering.',
    category: 'Soil Health',
    due_date: '2026-11-12',
    priority: 'high',
    status: 'pending',
    source: 'Optimizer',
    created_at: '2026-10-20'
  },
  {
    id: 5,
    user_id: 5,
    farm_id: 1,
    title: 'Installed 15 Yellow Sticky Traps across Mustard rows',
    description: 'Deployed sticky cards at canopy height for non-chemical aphid management.',
    category: 'Pest Control',
    due_date: '2026-10-24',
    priority: 'medium',
    status: 'completed',
    source: 'Mission',
    created_at: '2026-10-15'
  },
  {
    id: 6,
    user_id: 5,
    farm_id: 1,
    title: 'Submitted Composite Soil Core to District KVK Lab',
    description: 'Gathered 5 core depth samples across 5.5 acres for certified annual soil test card.',
    category: 'Soil Health',
    due_date: '2026-08-08',
    priority: 'high',
    status: 'completed',
    source: 'Manual',
    created_at: '2026-08-05'
  }
];

export const DEMO_MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Implement Micro-Irrigation / Drip Scheduling',
    description: 'Run your drip irrigation system for recommended duration based on crop moisture needs.',
    category_id: 1,
    difficulty: 'Medium',
    xp_reward: 100,
    duration_days: 7,
    requires_image: true,
    expected_practice_label: 'Drip Irrigation Installation',
    is_active: true,
    created_at: '2026-05-01'
  },
  {
    id: 2,
    title: 'Apply Organic Crop Straw Mulching',
    description: 'Cover soil around crop rows with 3 inches of straw to conserve moisture and suppress weeds.',
    category_id: 2,
    difficulty: 'Easy',
    xp_reward: 80,
    duration_days: 5,
    requires_image: true,
    expected_practice_label: 'Organic Mulching Practice',
    is_active: true,
    created_at: '2026-05-01'
  },
  {
    id: 3,
    title: 'Establish Vermicomposting Setup',
    description: 'Construct or maintain a vermicompost pit using cattle dung, crop residue, and earthworms.',
    category_id: 6,
    difficulty: 'Hard',
    xp_reward: 150,
    duration_days: 14,
    requires_image: true,
    expected_practice_label: 'Composting Setup',
    is_active: true,
    created_at: '2026-05-01'
  }
];

export const DEMO_BADGES: Badge[] = [
  { id: 1, name: 'Sustainability Starter', description: 'Started your sustainable farming journey by completing 1 mission.', icon_name: 'Award', xp_reward: 50, requirement_type: 'mission_count', requirement_value: '1' },
  { id: 2, name: 'Water Saver', description: 'Master of efficient irrigation and water conservation techniques.', icon_name: 'Droplets', xp_reward: 100, requirement_type: 'water_missions', requirement_value: '2' },
  { id: 3, name: 'Soil Protector', description: 'Champion of soil organic carbon and mulching practices.', icon_name: 'Sprout', xp_reward: 100, requirement_type: 'soil_missions', requirement_value: '2' },
  { id: 4, name: 'Compost Champion', description: 'Successfully set up or maintained a verified vermicomposting pit.', icon_name: 'Box', xp_reward: 150, requirement_type: 'compost_mission', requirement_value: '1' },
  { id: 5, name: 'Eco Farmer', description: 'Reached Level 3 Eco Farmer status through active participation.', icon_name: 'CheckCircle', xp_reward: 100, requirement_type: 'level_threshold', requirement_value: '3' }
];

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: 5, display_name: 'Gurpreet Singh', sustainability_score: 84.5, xp: 1250, level: 3, badges_count: 5 },
  { rank: 2, user_id: 2, display_name: 'Anugrah Sharma', sustainability_score: 76.0, xp: 1000, level: 3, badges_count: 4 },
  { rank: 3, user_id: 6, display_name: 'Balwinder Dhillon', sustainability_score: 72.0, xp: 820, level: 2, badges_count: 3 },
  { rank: 4, user_id: 7, display_name: 'Harpreet Kaur', sustainability_score: 70.5, xp: 760, level: 2, badges_count: 3 }
];
