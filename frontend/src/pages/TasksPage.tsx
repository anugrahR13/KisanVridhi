import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Calendar, Filter, AlertCircle } from 'lucide-react';
import { taskService, farmService } from '../services/appServices';
import { FarmTask, Farm } from '../types';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [farmId, setFarmId] = useState<number | undefined>(undefined);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksList, farmsList] = await Promise.all([
        taskService.getTasks(statusFilter === 'all' ? undefined : statusFilter),
        farmService.getFarms()
      ]);
      setTasks(tasksList);
      setFarms(farmsList);
      if (farmsList.length > 0 && !farmId) {
        setFarmId(farmsList[0].id);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      await taskService.createTask({
        farm_id: farmId,
        title,
        description,
        category,
        due_date: dueDate,
        priority
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      await taskService.toggleTask(id);
      loadTasks();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-700" /> Action Center Tasks
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage daily actionable farm tasks generated from AI recommendations, weather alerts, and manual scheduling.
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Completed
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Farm Task
          </button>
        </div>
      </div>

      {/* Task Creation Form */}
      {showForm && (
        <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase">Create New Action Task</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Inspect Wheat Field for Rust"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-slate-300 p-2 rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded bg-white"
              >
                <option value="Irrigation">Irrigation</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Soil Care">Soil Care</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Harvest">Harvest</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full border border-slate-300 p-2 rounded bg-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Description & Notes</label>
              <input
                type="text"
                placeholder="Details of what action to take on farm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border border-slate-300 p-2 rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full border border-slate-300 p-2 rounded bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded shadow-xs"
            >
              Save Action Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No tasks found for the selected filter status.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-0.5 h-4 w-4 text-green-700 rounded border-slate-300 focus:ring-green-700 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {task.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                        {task.priority.toUpperCase()} Priority
                      </span>
                      <span className="text-[10px] text-slate-500">Due: {task.due_date}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
