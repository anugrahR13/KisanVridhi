import { api } from './api';
import { 
  User, Farm, Mission, MissionProgress, Recommendation, 
  Badge, UserBadge, LeaderboardEntry, FarmerDashboardStats, 
  AdminStats, ChatMessage, ImageVerification, Crop, PracticeCategory,
  GovernmentAuction, CommunityPost, DiseaseDiagnosis, CropTracking, HelpDeskTicket,
  RewardItem, UserRewardRedemption, FertilizerRequest, FertilizerOptimizationResponse
} from '../types';
import { 
  DEMO_STATS, DEMO_FARMS, DEMO_WEATHER, DEMO_TASKS, 
  DEMO_MISSIONS, DEMO_BADGES, DEMO_LEADERBOARD 
} from './demoData';

const isDemo = () => localStorage.getItem('is_demo') === 'true';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  sendOtp: async (phone_number: string) => {
    const res = await api.post('/auth/otp/send', { phone_number });
    return res.data;
  },
  verifyOtp: async (phone_number: string, otp_code: string, full_name?: string, location?: string) => {
    const res = await api.post('/auth/otp/verify', { phone_number, otp_code, full_name, location });
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateMe: async (data: Partial<User>): Promise<User> => {
    const res = await api.put('/auth/me', data);
    return res.data;
  }
};

export const expenseService = {
  getExpenses: async (farmId?: number, category?: string) => {
    if (isDemo()) {
      const stored = localStorage.getItem('demo_expenses');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return [
        { id: 1, farm_id: farmId || 1, category: 'Seeds', amount: 4500, expense_date: '2026-05-10', description: 'Certified HD-2967 Wheat Seeds (100kg)' },
        { id: 2, farm_id: farmId || 1, category: 'Fertilizer', amount: 8200, expense_date: '2026-05-25', description: 'Bio-NPK & Organic Neem Cake' },
        { id: 3, farm_id: farmId || 1, category: 'Labour', amount: 12000, expense_date: '2026-06-15', description: 'Field preparation and sowing labor' }
      ];
    }
    const params: any = {};
    if (farmId) params.farm_id = farmId;
    if (category) params.category = category;
    try {
      const res = await api.get('/expenses', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  },
  createExpense: async (expenseData: any) => {
    if (isDemo()) {
      const stored = localStorage.getItem('demo_expenses');
      const list = stored ? JSON.parse(stored) : [
        { id: 1, farm_id: expenseData.farm_id || 1, category: 'Seeds', amount: 4500, expense_date: '2026-05-10', description: 'Certified HD-2967 Wheat Seeds' }
      ];
      const newExp = { id: Date.now(), ...expenseData, created_at: new Date().toISOString() };
      list.push(newExp);
      localStorage.setItem('demo_expenses', JSON.stringify(list));
      return newExp;
    }
    const res = await api.post('/expenses', expenseData);
    return res.data;
  },
  deleteExpense: async (id: number) => {
    if (isDemo()) {
      const stored = localStorage.getItem('demo_expenses');
      if (stored) {
        const list = JSON.parse(stored).filter((e: any) => e.id !== id);
        localStorage.setItem('demo_expenses', JSON.stringify(list));
      }
      return;
    }
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
  getSummary: async (farmId?: number) => {
    if (isDemo()) {
      return { total_expenses: 24700, by_category: { Seeds: 4500, Fertilizer: 8200, Labour: 12000 } };
    }
    const params = farmId ? { farm_id: farmId } : {};
    try {
      const res = await api.get('/expenses/summary', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return { total_expenses: 0, by_category: {} };
      throw err;
    }
  }
};

export const profitabilityService = {
  getRecords: async (farmId?: number) => {
    if (isDemo()) {
      return [
        {
          id: 1,
          crop_name: 'Wheat (HD-2967)',
          harvest_date: '2026-04-15',
          production_qty_kg: 4800.0,
          selling_price_per_kg: 24.5,
          revenue: 117600.0,
          total_expenses: 28200.0,
          net_profit: 89400.0,
          area_acres: 4.5,
          break_even_price_per_kg: 5.88,
          notes: 'High yield season with zero chemical pesticide usage.'
        }
      ];
    }
    const params = farmId ? { farm_id: farmId } : {};
    try {
      const res = await api.get('/profitability', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  },
  createRecord: async (recordData: any) => {
    if (isDemo()) {
      const revenue = (recordData.production_qty_kg || 0) * (recordData.selling_price_per_kg || 0);
      const netProfit = revenue - (recordData.total_expenses || 0);
      return {
        id: Date.now(),
        ...recordData,
        revenue,
        net_profit: netProfit,
        break_even_price_per_kg: (recordData.total_expenses || 0) / (recordData.production_qty_kg || 1),
        created_at: new Date().toISOString()
      };
    }
    const res = await api.post('/profitability', recordData);
    return res.data;
  },
  deleteRecord: async (id: number) => {
    const res = await api.delete(`/profitability/${id}`);
    return res.data;
  }
};

export const soilService = {
  getRecords: async (farmId?: number) => {
    if (isDemo()) {
      return [
        {
          id: 1,
          farm_id: farmId || 1,
          ph: 6.8,
          nitrogen_ppm: 165.0,
          phosphorus_ppm: 38.0,
          potassium_ppm: 210.0,
          organic_carbon_percent: 0.68,
          soil_type: 'Loamy',
          moisture_percent: 22.5,
          tested_at: '2026-07-20',
          notes: 'KVK District Lab test result. Good NPK balance.'
        }
      ];
    }
    const params = farmId ? { farm_id: farmId } : {};
    try {
      const res = await api.get('/soil', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  },
  createRecord: async (soilData: any) => {
    if (isDemo()) {
      return { id: Date.now(), ...soilData, created_at: new Date().toISOString() };
    }
    const res = await api.post('/soil', soilData);
    return res.data;
  },
  getGuidance: async (soilId: number) => {
    if (isDemo()) {
      return {
        ph_status: 'Optimal (6.5 - 7.5)',
        recommendations: ['Maintain organic matter addition with vermicompost', 'Drip fertigation recommended']
      };
    }
    const res = await api.get(`/soil/guidance/${soilId}`);
    return res.data;
  }
};

export const taskService = {
  getTasks: async (statusFilter?: string) => {
    if (isDemo()) return DEMO_TASKS;
    try {
      const params = statusFilter ? { status_filter: statusFilter } : {};
      const res = await api.get('/tasks', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_TASKS;
      throw err;
    }
  },
  createTask: async (taskData: any) => {
    if (isDemo()) {
      return { id: Date.now(), ...taskData, status: 'pending', created_at: new Date().toISOString() };
    }
    const res = await api.post('/tasks', taskData);
    return res.data;
  },
  updateTask: async (id: number, taskData: any) => {
    if (isDemo()) return { id, ...taskData };
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  toggleTask: async (id: number) => {
    if (isDemo()) return { message: 'Task toggled' };
    try {
      const res = await api.post(`/tasks/${id}/toggle`);
      return res.data;
    } catch (err: any) {
      if (!err.response) return { message: 'Task toggled' };
      throw err;
    }
  },
  deleteTask: async (id: number) => {
    if (isDemo()) return { message: 'Task deleted' };
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};

export const weatherService = {
  getWeather: async (location?: string, farmId?: number) => {
    if (isDemo()) return DEMO_WEATHER;
    try {
      const params: any = {};
      if (location) params.location = location;
      if (farmId) params.farm_id = farmId;
      const res = await api.get('/weather', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_WEATHER;
      throw err;
    }
  }
};

export const schemeService = {
  getSchemes: async (state?: string, crop?: string, category?: string) => {
    const params: any = {};
    if (state) params.state = state;
    if (crop) params.crop = crop;
    if (category) params.category = category;
    const res = await api.get('/schemes', { params });
    return res.data;
  },
  getDetail: async (id: number) => {
    const res = await api.get(`/schemes/${id}`);
    return res.data;
  }
};

export const documentService = {
  getDocuments: async (category?: string, farmId?: number) => {
    const demoDocs = [
      { id: 1, title: 'Official District KVK Soil Health Card 2026', category: 'Soil Report', file_path: '/uploads/documents/soil_health_card_2026.pdf', file_type: 'application/pdf', file_size_bytes: 245000, uploaded_at: '2026-07-20' },
      { id: 2, title: 'PMKSY Drip Irrigation Subsidy Sanction Certificate', category: 'Scheme Doc', file_path: '/uploads/documents/pmksy_drip_subsidy.pdf', file_type: 'application/pdf', file_size_bytes: 412000, uploaded_at: '2026-06-15' },
      { id: 3, title: 'Certified HD-2967 Organic Wheat Seed Purchase Bill', category: 'Bill/Receipt', file_path: '/uploads/documents/seed_invoice_hd2967.pdf', file_type: 'application/pdf', file_size_bytes: 185000, uploaded_at: '2026-05-12' },
      { id: 4, title: 'Kisan Credit Card (KCC) Land Record 7/12 Attestation', category: 'Other', file_path: '/uploads/documents/kcc_land_record_attestation.pdf', file_type: 'application/pdf', file_size_bytes: 320000, uploaded_at: '2026-04-10' }
    ];
    if (isDemo()) {
      return demoDocs.filter(d => !category || category === 'All' || d.category === category);
    }
    const params: any = {};
    if (category) params.category = category;
    if (farmId) params.farm_id = farmId;
    try {
      const res = await api.get('/documents', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) {
        return demoDocs.filter(d => !category || category === 'All' || d.category === category);
      }
      throw err;
    }
  },
  uploadDocument: async (title: string, category: string, file: File, farmId?: number) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', file);
    if (farmId) formData.append('farm_id', farmId.toString());

    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteDocument: async (id: number) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  }
};

export const marketService = {
  getPrices: async (state?: string, cropName?: string) => {
    const params: any = {};
    if (state) params.state = state;
    if (cropName) params.crop_name = cropName;
    const res = await api.get('/market/prices', { params });
    return res.data;
  },
  getMspAuctions: async () => {
    const res = await api.get('/market/msp-auctions');
    return res.data;
  }
};

export const farmService = {
  getFarms: async (): Promise<Farm[]> => {
    if (isDemo()) {
      const stored = localStorage.getItem('demo_farms');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return DEMO_FARMS;
    }
    try {
      const res = await api.get('/farms');
      return res.data;
    } catch (err: any) {
      if (!err.response) {
        const stored = localStorage.getItem('demo_farms');
        if (stored) {
          try { return JSON.parse(stored); } catch {}
        }
        return DEMO_FARMS;
      }
      throw err;
    }
  },
  getFarm: async (id: number): Promise<Farm> => {
    if (isDemo()) return DEMO_FARMS[0];
    try {
      const res = await api.get(`/farms/${id}`);
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_FARMS[0];
      throw err;
    }
  },
  createFarm: async (farmData: any): Promise<Farm> => {
    if (isDemo()) {
      const newFarm: Farm = {
        id: Date.now(),
        user_id: 1,
        ...farmData,
        crops: [{ id: 1, farm_id: Date.now(), crop_name: farmData.primary_crop, status: 'active', area_acres: farmData.area_acres }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('demo_farms', JSON.stringify([newFarm]));
      return newFarm;
    }
    try {
      const res = await api.post('/farms', farmData);
      return res.data;
    } catch (err: any) {
      if (!err.response) {
        const newFarm: Farm = {
          id: Date.now(),
          user_id: 1,
          ...farmData,
          crops: [{ id: 1, farm_id: Date.now(), crop_name: farmData.primary_crop, status: 'active', area_acres: farmData.area_acres }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('demo_farms', JSON.stringify([newFarm]));
        return newFarm;
      }
      throw err;
    }
  },
  updateFarm: async (id: number, farmData: any): Promise<Farm> => {
    if (isDemo()) {
      const updated: Farm = {
        id,
        user_id: 1,
        ...farmData,
        crops: [{ id: 1, farm_id: id, crop_name: farmData.primary_crop, status: 'active', area_acres: farmData.area_acres }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('demo_farms', JSON.stringify([updated]));
      return updated;
    }
    try {
      const res = await api.put(`/farms/${id}`, farmData);
      return res.data;
    } catch (err: any) {
      if (!err.response) {
        const updated: Farm = {
          id,
          user_id: 1,
          ...farmData,
          crops: [{ id: 1, farm_id: id, crop_name: farmData.primary_crop, status: 'active', area_acres: farmData.area_acres }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('demo_farms', JSON.stringify([updated]));
        return updated;
      }
      throw err;
    }
  },
  deleteFarm: async (id: number) => {
    if (isDemo()) {
      localStorage.removeItem('demo_farms');
      return;
    }
    const res = await api.delete(`/farms/${id}`);
    return res.data;
  },
  addCrop: async (farmId: number, cropData: Crop): Promise<Crop> => {
    if (isDemo()) {
      const stored = localStorage.getItem('demo_farms');
      const farmList = stored ? JSON.parse(stored) : [...DEMO_FARMS];
      const target = farmList[0];
      const newCrop = { id: Date.now(), farm_id: farmId, ...cropData };
      target.crops = [...(target.crops || []), newCrop];
      localStorage.setItem('demo_farms', JSON.stringify(farmList));
      return newCrop;
    }
    const res = await api.post(`/farms/${farmId}/crops`, cropData);
    return res.data;
  }
};

export const recommendationService = {
  getRecommendations: async (): Promise<Recommendation[]> => {
    if (isDemo()) return DEMO_STATS.recent_recommendations;
    try {
      const res = await api.get('/recommendations');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_STATS.recent_recommendations;
      throw err;
    }
  },
  generateRecommendations: async (farmId: number): Promise<Recommendation[]> => {
    if (isDemo()) return DEMO_STATS.recent_recommendations;
    try {
      const res = await api.post(`/recommendations/generate?farm_id=${farmId}`);
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_STATS.recent_recommendations;
      throw err;
    }
  }
};

export const missionService = {
  getMissions: async (category_id?: number, difficulty?: string): Promise<Mission[]> => {
    if (isDemo()) return DEMO_MISSIONS;
    try {
      const params: any = {};
      if (category_id) params.category_id = category_id;
      if (difficulty) params.difficulty = difficulty;
      const res = await api.get('/missions', { params });
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_MISSIONS;
      throw err;
    }
  },
  getMyProgress: async (): Promise<MissionProgress[]> => {
    if (isDemo()) return [];
    try {
      const res = await api.get('/missions/my-progress');
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  },
  startMission: async (missionId: number, farmId?: number): Promise<MissionProgress> => {
    const params = farmId ? `?farm_id=${farmId}` : '';
    const res = await api.post(`/missions/${missionId}/start${params}`);
    return res.data;
  },
  completeMission: async (missionId: number) => {
    const res = await api.post(`/missions/${missionId}/complete`);
    return res.data;
  }
};

export const verificationService = {
  uploadImage: async (missionId: number, file: File) => {
    const formData = new FormData();
    formData.append('mission_id', missionId.toString());
    formData.append('file', file);

    const res = await api.post('/verifications/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};

export const gamificationService = {
  getBadges: async (): Promise<Badge[]> => {
    if (isDemo()) return DEMO_BADGES;
    try {
      const res = await api.get('/badges');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_BADGES;
      throw err;
    }
  },
  getUserBadges: async (): Promise<UserBadge[]> => {
    if (isDemo()) return DEMO_BADGES.slice(0, 2).map((b, i) => ({ id: i + 1, badge: b, awarded_at: '2026-08-15' }));
    try {
      const res = await api.get('/users/me/badges');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_BADGES.slice(0, 2).map((b, i) => ({ id: i + 1, badge: b, awarded_at: '2026-08-15' }));
      throw err;
    }
  },
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    if (isDemo()) return DEMO_LEADERBOARD;
    try {
      const res = await api.get('/leaderboard');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_LEADERBOARD;
      throw err;
    }
  },
  getNotifications: async () => {
    if (isDemo()) return [];
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  }
};

export const assistantService = {
  chat: async (message: string, farmId?: number) => {
    if (isDemo()) {
      return {
        answer: `[Demo Mode Advisory] Based on your farm in Ludhiana with Loamy soil and Wheat crop: We recommend maintaining drip irrigation intervals and top-dressing with organic mulching to conserve moisture.`,
        sources: [
          { title: "ICAR Crop Management Guide 2026", source: "ICAR", snippet: "Organic mulching saves 25% soil moisture." }
        ]
      };
    }
    const res = await api.post('/assistant/chat', { message, farm_id: farmId });
    return res.data;
  }
};

export const dashboardService = {
  getStats: async (): Promise<FarmerDashboardStats> => {
    if (isDemo()) return DEMO_STATS;
    try {
      const res = await api.get('/dashboard/stats');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_STATS;
      throw err;
    }
  },
  getAnalytics: async () => {
    if (isDemo()) {
      return {
        score_history: [
          { date: 'Oct 01', overall: 65, water: 70, soil: 62, waste: 60, diversity: 68, resource: 65 },
          { date: 'Oct 10', overall: 70, water: 76, soil: 68, waste: 65, diversity: 72, resource: 70 },
          { date: 'Oct 20', overall: 76, water: 82, soil: 74, waste: 70, diversity: 78, resource: 76 }
        ],
        xp_history: [
          { date: 'Oct 17', description: 'Community Contribution', amount: 25 },
          { date: 'Oct 18', description: 'AI Crop Diagnosis', amount: 30 },
          { date: 'Oct 19', description: 'Completed Mission: Zero Stubble Burning', amount: 160 }
        ]
      };
    }
    const res = await api.get('/dashboard/analytics');
    return res.data;
  }
};

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  createMission: async (missionData: any): Promise<Mission> => {
    const res = await api.post('/admin/missions', missionData);
    return res.data;
  },
  updateMission: async (id: number, missionData: any): Promise<Mission> => {
    const res = await api.put(`/admin/missions/${id}`, missionData);
    return res.data;
  },
  deleteMission: async (id: number) => {
    const res = await api.delete(`/admin/missions/${id}`);
    return res.data;
  },
  getVerifications: async (): Promise<ImageVerification[]> => {
    const res = await api.get('/admin/verifications');
    return res.data;
  },
  getCategories: async (): Promise<PracticeCategory[]> => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  reviewVerification: async (id: number, action: 'approved' | 'rejected', notes?: string) => {
    const res = await api.post(`/admin/verifications/${id}/review?action=${action}`, { notes });
    return res.data;
  }
};

export const auctionService = {
  getAuctions: async (): Promise<GovernmentAuction[]> => {
    const res = await api.get('/auctions');
    return res.data;
  },
  applyAuction: async (id: number) => {
    const res = await api.post(`/auctions/apply/${id}`);
    return res.data;
  }
};

export const communityService = {
  getPosts: async (): Promise<CommunityPost[]> => {
    const res = await api.get('/community');
    return res.data;
  },
  createPost: async (postData: { title: string; content: string; category?: string }): Promise<CommunityPost> => {
    const res = await api.post('/community', postData);
    return res.data;
  },
  upvotePost: async (id: number) => {
    const res = await api.post(`/community/${id}/upvote`);
    return res.data;
  }
};

export const diseaseService = {
  analyze: async (cropName?: string, file?: File): Promise<DiseaseDiagnosis> => {
    if (isDemo()) {
      return {
        id: Date.now(),
        crop_detected: cropName || 'Wheat',
        disease_name: 'Wheat Yellow Rust (Puccinia striiformis)',
        confidence_score: 94.2,
        severity: 'Moderate',
        organic_treatment: 'Spray 5% Neem Seed Kernel Extract (NSKE) or fermented sour buttermilk (1:10 ratio) every 7 days.',
        chemical_treatment: 'Propiconazole 25% EC @ 1ml/L water or Tebuconazole 25.9% EC @ 1ml/L water.',
        preventive_measure: 'Adopt early sowing, avoid excess nitrogen fertilizer, use resistant varieties like HD-3086 or PBW-725.',
        recommended_quest: 'Implement Organic Foliar Spray Quest',
        image_url: undefined,
        heatmap_url: undefined,
        lesion_coverage_pct: 22.4,
        saliency_features: [
            'Peak Grad-CAM activation on chlorotic leaf margin (22.4% area)',
            'Interveinal necrosis with elevated fungal mycelium density',
            'Stomatal pore disruption and foliar moisture stress signature'
        ],
        expert_escalation_required: false,
        uncertainty_warning: undefined
      };
    }
    try {
      const formData = new FormData();
      if (cropName) formData.append('crop_name', cropName);
      if (file) formData.append('file', file);
      const res = await api.post('/disease-detection/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err: any) {
      if (!err.response) {
        return {
          id: Date.now(),
          crop_detected: cropName || 'Wheat',
          disease_name: 'Wheat Yellow Rust (Puccinia striiformis)',
          confidence_score: 94.2,
          severity: 'Moderate',
          organic_treatment: 'Spray 5% Neem Seed Kernel Extract (NSKE) or fermented sour buttermilk (1:10 ratio) every 7 days.',
          chemical_treatment: 'Propiconazole 25% EC @ 1ml/L water or Tebuconazole 25.9% EC @ 1ml/L water.',
          preventive_measure: 'Adopt early sowing, avoid excess nitrogen fertilizer, use resistant varieties like HD-3086 or PBW-725.',
          recommended_quest: 'Implement Organic Foliar Spray Quest',
          image_url: undefined,
          heatmap_url: undefined,
          lesion_coverage_pct: 22.4,
          saliency_features: [
              'Peak Grad-CAM activation on chlorotic leaf margin (22.4% area)',
              'Interveinal necrosis with elevated fungal mycelium density',
              'Stomatal pore disruption and foliar moisture stress signature'
          ],
          expert_escalation_required: false,
          uncertainty_warning: undefined
        };
      }
      throw err;
    }
  },
  getHistory: async (): Promise<DiseaseDiagnosis[]> => {
    if (isDemo()) {
      return [
        {
          id: 1,
          crop_detected: 'Wheat',
          disease_name: 'Wheat Yellow Rust',
          confidence_score: 91.5,
          severity: 'Moderate',
          organic_treatment: 'Neem spray 5%',
          chemical_treatment: 'Propiconazole 25% EC',
          preventive_measure: 'Crop rotation & clean seed',
          lesion_coverage_pct: 21.0,
          uncertainty_warning: undefined
        }
      ];
    }
    try {
      const res = await api.get('/disease-detection/history');
      return res.data;
    } catch (err: any) {
      if (!err.response) return [];
      throw err;
    }
  }
};

export const cropTrackingService = {
  getCrops: async (): Promise<CropTracking[]> => {
    const res = await api.get('/crop-tracking');
    return res.data;
  },
  updateGrowthStage: async (id: number, stageData: any) => {
    const res = await api.put(`/crop-tracking/${id}/growth-stage`, stageData);
    return res.data;
  }
};

export const helpDeskService = {
  getTickets: async (): Promise<HelpDeskTicket[]> => {
    const res = await api.get('/help-desk');
    return res.data;
  },
  createTicket: async (ticketData: { subject: string; category: string; description: string }): Promise<HelpDeskTicket> => {
    const res = await api.post('/help-desk', ticketData);
    return res.data;
  }
};

export const rewardService = {
  getRewards: async (): Promise<RewardItem[]> => {
    const defaultRewards = [
      { id: 1, title: '₹500 Organic Seeds Discount Voucher', description: 'Get ₹500 off certified seeds at any IFFCO / Krishi Kendra.', category: 'Seeds & Inputs', points_cost: 250, sponsor_agency: 'IFFCO / State Seed Corp', image_icon: 'Sprout', inventory_count: 50, is_active: true },
      { id: 2, title: 'Free Soil Health Lab Test Voucher', description: '1 free NPK + Micronutrient soil lab test at district KVK lab.', category: 'Services', points_cost: 300, sponsor_agency: 'Soil Health Card Mission', image_icon: 'CheckCircle2', inventory_count: 40, is_active: true },
      { id: 3, title: '15% Subsidy Voucher for Drip Kit', description: 'Exclusive 15% discount coupon on micro-drip lateral pipes.', category: 'Equipment', points_cost: 400, sponsor_agency: 'PMKSY Scheme', image_icon: 'Droplets', inventory_count: 30, is_active: true }
    ];
    if (isDemo()) return defaultRewards;
    try {
      const res = await api.get('/rewards');
      return res.data;
    } catch (err: any) {
      if (!err.response) return defaultRewards;
      throw err;
    }
  },
  getMyRedemptions: async (): Promise<UserRewardRedemption[]> => {
    const defaultRedemptions = [
      { id: 1, reward_id: 1, reward_title: '₹500 Organic Seeds Discount Voucher', points_spent: 250, voucher_code: 'SEED500-ECO9824', status: 'Active', redeemed_at: '2026-10-20' }
    ];
    if (isDemo()) return defaultRedemptions;
    try {
      const res = await api.get('/rewards/my-redemptions');
      return res.data;
    } catch (err: any) {
      if (!err.response) return defaultRedemptions;
      throw err;
    }
  },
  redeemReward: async (rewardId: number) => {
    const res = await api.post(`/rewards/redeem/${rewardId}`);
    return res.data;
  }
};

export const fertilizerService = {
  optimize: async (data: FertilizerRequest): Promise<FertilizerOptimizationResponse> => {
    if (isDemo()) {
      return getDemoFertilizerCalculation(data);
    }
    try {
      const res = await api.post('/fertilizer/optimize', data);
      return res.data;
    } catch (err: any) {
      if (!err.response) return getDemoFertilizerCalculation(data);
      throw err;
    }
  }
};

function getDemoFertilizerCalculation(req: FertilizerRequest): FertilizerOptimizationResponse {
  const acres = Math.max(0.1, req.area_acres || 1.0);
  const nReqPerAcre = 50.0;
  const pReqPerAcre = 25.0;
  const kReqPerAcre = 16.0;

  const totalN = Math.round(nReqPerAcre * acres * 10) / 10;
  const totalP = Math.round(pReqPerAcre * acres * 10) / 10;
  const totalK = Math.round(kReqPerAcre * acres * 10) / 10;

  const dapBags = Math.round((totalP / 23.0) * 10) / 10;
  const nFromDap = dapBags * 9.0;
  const remN = Math.max(0, totalN - nFromDap);
  const ureaBags = Math.round((remN / 20.7) * 10) / 10;
  const mopBags = Math.round((totalK / 30.0) * 10) / 10;

  const optCost = Math.round(dapBags * 1350 + ureaBags * 267 + mopBags * 1700);
  const custCost = Math.round(dapBags * 1350 + (ureaBags * 1.45) * 267 + mopBags * 1700);
  const savings = Math.max(0, custCost - optCost);

  const basalUrea = Math.round(ureaBags * 0.33 * 10) / 10;
  const top1Urea = Math.round(ureaBags * 0.33 * 10) / 10;
  const top2Urea = Math.round((ureaBags - basalUrea - top1Urea) * 10) / 10;

  return {
    crop_name: req.crop_name || 'Wheat',
    area_acres: acres,
    soil_status: {
      nitrogen: 'Optimal (165 ppm) — Standard Dose',
      phosphorus: 'Optimal (38 ppm) — Standard Dose',
      potassium: 'Optimal (210 ppm) — Standard Dose'
    },
    nutrient_requirements: {
      n_kg_per_acre: nReqPerAcre,
      p2o5_kg_per_acre: pReqPerAcre,
      k2o_kg_per_acre: kReqPerAcre,
      total_n_kg: totalN,
      total_p2o5_kg: totalP,
      total_k2o_kg: totalK
    },
    commercial_bags: {
      dap_bags: dapBags,
      urea_bags: ureaBags,
      mop_bags: mopBags,
      dap_weight_kg: Math.round(dapBags * 50),
      urea_weight_kg: Math.round(ureaBags * 45),
      mop_weight_kg: Math.round(mopBags * 50),
      estimated_cost_inr: optCost,
      customary_cost_inr: custCost,
      estimated_savings_inr: savings
    },
    application_schedule: [
      {
        stage_name: 'Basal Dressing (At Sowing)',
        timing: 'Day 0 — Field preparation and sowing',
        dap_bags: dapBags,
        urea_bags: basalUrea,
        mop_bags: mopBags,
        instructions: 'Broadcast entire DAP and MOP with 1/3rd Urea at final plowing, drilled 3-5 cm below seed depth.'
      },
      {
        stage_name: '1st Top-Dressing (Crown Root Initiation)',
        timing: 'Day 21 - 25 — Before first light irrigation',
        dap_bags: 0,
        urea_bags: top1Urea,
        mop_bags: 0,
        instructions: 'Evenly broadcast Urea over dry crop foliage, followed immediately by first irrigation.'
      },
      {
        stage_name: '2nd Top-Dressing (Panicle Initiation)',
        timing: 'Day 45 - 55 — Pre-flowering stage',
        dap_bags: 0,
        urea_bags: top2Urea,
        mop_bags: 0,
        instructions: 'Apply final Urea dose to boost grain fill. Do not apply if heavy rain is imminent.'
      }
    ],
    organic_alternatives: [
      {
        item_name: 'Well-Decomposed Vermicompost',
        dosage: `${(1.5 * acres).toFixed(1)} - ${(2.0 * acres).toFixed(1)} Tonnes total`,
        benefit: 'Boosts soil organic carbon, moisture retention, and supplies micronutrients (Zn, Fe).'
      },
      {
        item_name: 'Bio-NPK Consortia (Azotobacter + PSB + KSB)',
        dosage: '1 Litre / acre in drip line or 50kg farmyard manure blend',
        benefit: 'Fixes 20-25 kg atmospheric Nitrogen and solubilizes native soil phosphorus.'
      },
      {
        item_name: 'Neem Seed Cake Blend',
        dosage: `${Math.round(100 * acres)} kg total at basal stage`,
        benefit: 'Natural nitrification inhibitor slowing nitrogen leaching and suppressing soil nematodes.'
      }
    ],
    agronomic_advisory: [
      `For ${req.crop_name || 'Wheat'} across ${acres} acres, precision dosage recommends ${ureaBags} bags Urea, ${dapBags} bags DAP, and ${mopBags} bags MOP.`,
      `Precision dosage saves an estimated ₹${savings.toLocaleString()} compared to conventional broadcast overdosing.`,
      'Always utilize Neem-Coated Urea (NCU) to maximize nitrogen use efficiency by 15-20%.',
      'Maintain moist soil conditions before and during fertilizer application to minimize volatile ammonia loss.'
    ]
  };
}
