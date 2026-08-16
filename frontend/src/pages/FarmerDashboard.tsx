import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CloudSun, Droplet, Sprout, AlertTriangle, CheckCircle2, 
  ArrowRight, ShieldCheck, Tractor, DollarSign, Target, Plus, RefreshCw, AlertCircle
} from 'lucide-react';
import { dashboardService, weatherService, taskService, farmService } from '../services/appServices';
import { FarmerDashboardStats, WeatherData, FarmTask, Farm } from '../types';

export const FarmerDashboard: React.FC = () => {
  const [stats, setStats] = useState<FarmerDashboardStats | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, farmsData] = await Promise.all([
        dashboardService.getStats(),
        farmService.getFarms()
      ]);
      setStats(statsData);
      setFarms(farmsData);

      const activeFarm = farmsData.length > 0 ? farmsData[0] : null;
      const [weatherData, tasksData] = await Promise.all([
        weatherService.getWeather(activeFarm?.location || statsData.user.location || 'Punjab', activeFarm?.id),
        taskService.getTasks('pending')
      ]);

      setWeather(weatherData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load database state. Please ensure the backend server and database are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId: number) => {
    try {
      await taskService.toggleTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2 text-slate-600 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-green-700" />
          <span>Loading farm status...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg my-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-red-900">Database Connection Unavailable</h2>
        <p className="text-xs text-red-700 mt-1 max-w-lg mx-auto">{error || 'Could not connect to database.'}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-md shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const activeFarm = farms.length > 0 ? farms[0] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Farmer Action Center</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-800 border border-green-200">
              Active Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Welcome back, <span className="font-semibold text-slate-900">{stats.user.full_name}</span>. Here is your farm status for today.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <Link
            to="/farm-profile"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Tractor className="w-3.5 h-3.5" />
            Manage Farms ({farms.length})
          </Link>
          <Link
            to="/tasks"
            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Link>
        </div>
      </div>

      {/* SECTION 1: TODAY'S FARM CHECK */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          TODAY'S FARM CHECK
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weather Alert / Interpretation */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <CloudSun className="w-4 h-4 text-blue-600" /> Weather Check
              </span>
              <span>{weather?.location}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-slate-900">{weather?.temperature_c}°C</span>
              <span className="text-xs font-medium text-slate-600">Rain Prob: {weather?.rain_probability_percent}%</span>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-snug">
              {weather?.platform_interpretation}
            </p>
          </div>

          {/* Smart Irrigation Advice */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <Droplet className="w-4 h-4 text-cyan-600" /> Smart Irrigation
              </span>
              <span className="text-xs font-medium text-slate-500">{activeFarm?.irrigation_type || 'Drip'}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {weather && weather.rain_probability_percent > 50 ? 'Hold Irrigation Today' : 'Scheduled Irrigation'}
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-snug">
              Based on weather forecast & {activeFarm?.primary_crop || 'crop'} requirements.
            </p>
          </div>

          {/* Priority Recommendation */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Top AI Recommendation
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                High Priority
              </span>
            </div>
            {stats.recent_recommendations.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-slate-900">{stats.recent_recommendations[0].title}</p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{stats.recent_recommendations[0].reason}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">No active recommendations. Farm practices are optimal.</p>
            )}
          </div>

          {/* Urgent Tasks Count */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-700" /> Tasks Due Today
              </span>
              <span className="text-xs font-bold text-green-800 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                {tasks.length} Pending
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{tasks.length}</div>
            <p className="text-xs text-slate-600">Actionable items requiring attention on your farm.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: MY FARM & ACTIONABLE TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Farm Details & Actionable Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Farm Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-green-700" />
                  {activeFarm ? activeFarm.farm_name : 'No Farm Registered'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeFarm?.location || 'Add your farm to enable full monitoring'}</p>
              </div>
              <Link
                to="/farm-profile"
                className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1"
              >
                View Farm Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeFarm ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Primary Crop</span>
                  <span className="font-semibold text-slate-900">{activeFarm.primary_crop}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Total Area</span>
                  <span className="font-semibold text-slate-900">{activeFarm.area_acres} Acres</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Soil Type</span>
                  <span className="font-semibold text-slate-900">{activeFarm.soil_type}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Irrigation</span>
                  <span className="font-semibold text-slate-900">{activeFarm.irrigation_type}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-600 mb-3">Register your farm location, area, and crop details to unlock personalized decision support.</p>
                <Link
                  to="/farm-profile"
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs"
                >
                  Create Your First Farm
                </Link>
              </div>
            )}
          </div>

          {/* Actionable Daily Tasks */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                Actionable Farm Tasks ({tasks.length})
              </h3>
              <Link to="/tasks" className="text-xs font-semibold text-green-800 hover:text-green-900">
                View All Tasks
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded border border-slate-100">
                No pending tasks due today. All scheduled farm tasks are completed!
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-0.5 h-4 w-4 text-green-700 rounded border-slate-300 focus:ring-green-700 cursor-pointer"
                      />
                      <div>
                        <p className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-500">Due: {task.due_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: THIS WEEK & RECENT ACTIVITY */}
        <div className="space-y-6">
          {/* Sustainability Score Breakdown */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                Sustainability Score
              </h3>
              <span className="text-lg font-black text-green-800">
                {stats.user.sustainability_score.toFixed(1)} / 100
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Water Conservation</span>
                <span className="font-semibold text-slate-900">{stats.sustainability_breakdown.water_score.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.sustainability_breakdown.water_score}%` }} />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Soil Health</span>
                <span className="font-semibold text-slate-900">{stats.sustainability_breakdown.soil_score.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-700 h-1.5 rounded-full" style={{ width: `${stats.sustainability_breakdown.soil_score}%` }} />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Waste Management</span>
                <span className="font-semibold text-slate-900">{stats.sustainability_breakdown.waste_score.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${stats.sustainability_breakdown.waste_score}%` }} />
              </div>
            </div>
          </div>

          {/* Expenses & Mission Summary */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="w-4 h-4 text-green-700" />
              Financial & Missions Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Total Expenses</span>
                <span className="text-sm font-bold text-slate-900">₹{(stats as any).total_expenses || 0}</span>
                <Link to="/expenses" className="text-[11px] text-green-800 font-semibold block mt-1 hover:underline">
                  View Expenses →
                </Link>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Completed Missions</span>
                <span className="text-sm font-bold text-slate-900">{stats.completed_missions_count} Missions</span>
                <Link to="/missions" className="text-[11px] text-green-800 font-semibold block mt-1 hover:underline">
                  View Missions →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Database Activity */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Recent Activity History
            </h3>
            {stats.recent_activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No recent transactions or activity logs found.</p>
            ) : (
              <div className="space-y-2">
                {stats.recent_activities.slice(0, 4).map(act => (
                  <div key={act.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-slate-700 truncate max-w-[180px]">{act.description}</span>
                    <span className="font-bold text-green-800 shrink-0">+{act.amount} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
