import { api } from './api';
import { 
  User, Farm, Mission, MissionProgress, Recommendation, 
  Badge, UserBadge, LeaderboardEntry, FarmerDashboardStats, 
  AdminStats, ChatMessage, ImageVerification, Crop, PracticeCategory,
  GovernmentAuction, CommunityPost, DiseaseDiagnosis, CropTracking, HelpDeskTicket,
  RewardItem, UserRewardRedemption
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
    const params: any = {};
    if (farmId) params.farm_id = farmId;
    if (category) params.category = category;
    const res = await api.get('/expenses', { params });
    return res.data;
  },
  createExpense: async (expenseData: any) => {
    const res = await api.post('/expenses', expenseData);
    return res.data;
  },
  deleteExpense: async (id: number) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
  getSummary: async (farmId?: number) => {
    const params = farmId ? { farm_id: farmId } : {};
    const res = await api.get('/expenses/summary', { params });
    return res.data;
  }
};

export const profitabilityService = {
  getRecords: async (farmId?: number) => {
    const params = farmId ? { farm_id: farmId } : {};
    const res = await api.get('/profitability', { params });
    return res.data;
  },
  createRecord: async (recordData: any) => {
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
    const params = farmId ? { farm_id: farmId } : {};
    const res = await api.get('/soil', { params });
    return res.data;
  },
  createRecord: async (soilData: any) => {
    const res = await api.post('/soil', soilData);
    return res.data;
  },
  getGuidance: async (soilId: number) => {
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
    const res = await api.post('/tasks', taskData);
    return res.data;
  },
  updateTask: async (id: number, taskData: any) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  toggleTask: async (id: number) => {
    const res = await api.post(`/tasks/${id}/toggle`);
    return res.data;
  },
  deleteTask: async (id: number) => {
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
    const params: any = {};
    if (category) params.category = category;
    if (farmId) params.farm_id = farmId;
    const res = await api.get('/documents', { params });
    return res.data;
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
    if (isDemo()) return DEMO_FARMS;
    try {
      const res = await api.get('/farms');
      return res.data;
    } catch (err: any) {
      if (!err.response) return DEMO_FARMS;
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
    const res = await api.post('/farms', farmData);
    return res.data;
  },
  updateFarm: async (id: number, farmData: any): Promise<Farm> => {
    const res = await api.put(`/farms/${id}`, farmData);
    return res.data;
  },
  deleteFarm: async (id: number) => {
    const res = await api.delete(`/farms/${id}`);
    return res.data;
  },
  addCrop: async (farmId: number, cropData: Crop): Promise<Crop> => {
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
    const res = await api.post(`/recommendations/generate?farm_id=${farmId}`);
    return res.data;
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
    const formData = new FormData();
    if (cropName) formData.append('crop_name', cropName);
    if (file) formData.append('file', file);
    const res = await api.post('/disease-detection/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getHistory: async (): Promise<DiseaseDiagnosis[]> => {
    const res = await api.get('/disease-detection/history');
    return res.data;
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
    const res = await api.get('/rewards');
    return res.data;
  },
  getMyRedemptions: async (): Promise<UserRewardRedemption[]> => {
    const res = await api.get('/rewards/my-redemptions');
    return res.data;
  },
  redeemReward: async (rewardId: number) => {
    const res = await api.post(`/rewards/redeem/${rewardId}`);
    return res.data;
  }
};
