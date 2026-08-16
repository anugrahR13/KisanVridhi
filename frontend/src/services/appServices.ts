import { api } from './api';
import { 
  User, Farm, Mission, MissionProgress, Recommendation, 
  Badge, UserBadge, LeaderboardEntry, FarmerDashboardStats, 
  AdminStats, ChatMessage, ImageVerification, Crop, PracticeCategory,
  GovernmentAuction, CommunityPost, DiseaseDiagnosis, CropTracking, HelpDeskTicket,
  RewardItem, UserRewardRedemption
} from '../types';

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
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const res = await api.get('/tasks', { params });
    return res.data;
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
    const params: any = {};
    if (location) params.location = location;
    if (farmId) params.farm_id = farmId;
    const res = await api.get('/weather', { params });
    return res.data;
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
    const res = await api.get('/farms');
    return res.data;
  },
  getFarm: async (id: number): Promise<Farm> => {
    const res = await api.get(`/farms/${id}`);
    return res.data;
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
    const res = await api.get('/recommendations');
    return res.data;
  },
  generateRecommendations: async (farmId: number): Promise<Recommendation[]> => {
    const res = await api.post(`/recommendations/generate?farm_id=${farmId}`);
    return res.data;
  }
};

export const missionService = {
  getMissions: async (category_id?: number, difficulty?: string): Promise<Mission[]> => {
    const params: any = {};
    if (category_id) params.category_id = category_id;
    if (difficulty) params.difficulty = difficulty;
    const res = await api.get('/missions', { params });
    return res.data;
  },
  getMyProgress: async (): Promise<MissionProgress[]> => {
    const res = await api.get('/missions/my-progress');
    return res.data;
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
    const res = await api.get('/badges');
    return res.data;
  },
  getUserBadges: async (): Promise<UserBadge[]> => {
    const res = await api.get('/users/me/badges');
    return res.data;
  },
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await api.get('/leaderboard');
    return res.data;
  },
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  }
};

export const assistantService = {
  chat: async (message: string, farmId?: number) => {
    const res = await api.post('/assistant/chat', { message, farm_id: farmId });
    return res.data;
  }
};

export const dashboardService = {
  getStats: async (): Promise<FarmerDashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
  getAnalytics: async () => {
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
