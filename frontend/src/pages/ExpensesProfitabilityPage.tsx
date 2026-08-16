import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, TrendingUp, Calculator, PieChart, AlertCircle } from 'lucide-react';
import { expenseService, profitabilityService, farmService } from '../services/appServices';
import { FarmExpense, ProfitRecord, Farm } from '../types';

export const ExpensesProfitabilityPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [profitRecords, setProfitRecords] = useState<ProfitRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showProfitForm, setShowProfitForm] = useState(false);

  const [category, setCategory] = useState('Seeds');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [cropName, setCropName] = useState('Wheat');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionQty, setProductionQty] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [totalExpenseOverride, setTotalExpenseOverride] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const farmsList = await farmService.getFarms();
      setFarms(farmsList);
      const activeFarmId = selectedFarmId || (farmsList.length > 0 ? farmsList[0].id : undefined);

      if (activeFarmId) {
        setSelectedFarmId(activeFarmId);
        const [expList, expSummary, profitList] = await Promise.all([
          expenseService.getExpenses(activeFarmId),
          expenseService.getSummary(activeFarmId),
          profitabilityService.getRecords(activeFarmId)
        ]);
        setExpenses(expList);
        setSummary(expSummary);
        setProfitRecords(profitList);
      }
    } catch (err) {
      console.error('Error loading expenses & profitability data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFarmId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId || !amount || !description) return;
    try {
      await expenseService.createExpense({
        farm_id: selectedFarmId,
        category,
        amount: parseFloat(amount),
        expense_date: expenseDate,
        description
      });
      setShowExpenseForm(false);
      setAmount('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await expenseService.deleteExpense(id);
      loadData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleAddProfitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId || !productionQty || !sellingPrice) return;
    try {
      await profitabilityService.createRecord({
        farm_id: selectedFarmId,
        crop_name: cropName,
        harvest_date: harvestDate,
        production_qty_kg: parseFloat(productionQty),
        selling_price_per_kg: parseFloat(sellingPrice),
        total_expenses: totalExpenseOverride ? parseFloat(totalExpenseOverride) : (summary?.total_expenses || 0)
      });
      setShowProfitForm(false);
      setProductionQty('');
      setSellingPrice('');
      setTotalExpenseOverride('');
      loadData();
    } catch (err) {
      console.error('Error calculating profit:', err);
    }
  };

  const handleDeleteProfitRecord = async (id: number) => {
    try {
      await profitabilityService.deleteRecord(id);
      loadData();
    } catch (err) {
      console.error('Error deleting profit record:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-700" /> Farm Expenses & Profitability Manager
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Record real operational costs, track category expenditure, and calculate break-even net profitability.
          </p>
        </div>
        
        {farms.length > 0 && (
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-700">Select Farm:</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="text-xs border border-slate-300 rounded-md p-1.5 bg-white font-medium focus:ring-green-700"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.farm_name} ({f.primary_crop})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Total Recorded Expenses</span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{summary?.total_expenses || 0}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">{summary?.total_count || 0} Expense Transactions</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Latest Net Harvest Profit</span>
          <div className="text-2xl font-black text-green-800 mt-1">
            ₹{profitRecords.length > 0 ? profitRecords[0].net_profit : 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {profitRecords.length > 0 ? `${profitRecords[0].crop_name} (${profitRecords[0].harvest_date})` : 'No harvest recorded yet'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Break-Even Price Target</span>
          <div className="text-2xl font-black text-amber-800 mt-1">
            ₹{profitRecords.length > 0 ? profitRecords[0].break_even_price_per_kg : 0} / kg
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Minimum selling price required for profit</span>
        </div>
      </div>

      {/* Category Breakdown & Action Buttons */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-green-700" /> Expense Category Breakdown
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense Log
            </button>
            <button
              onClick={() => setShowProfitForm(!showProfitForm)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" /> Record Harvest Profitability
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        {showExpenseForm && (
          <form onSubmit={handleAddExpense} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Add New Operational Expense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                >
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Labour">Labour</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Transport">Transport</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Organic DAP Fertilizer bag"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded shadow-xs"
              >
                Save Expense
              </button>
            </div>
          </form>
        )}

        {/* Add Profit Calculation Form */}
        {showProfitForm && (
          <form onSubmit={handleAddProfitRecord} className="p-4 bg-blue-50/70 border border-blue-200 rounded-md space-y-3">
            <h3 className="text-xs font-bold text-blue-900">Calculate Harvest Profitability & Break-Even</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Crop Name</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Production Qty (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={productionQty}
                  onChange={(e) => setProductionQty(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹ / kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 24.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Expenses Override (₹)</label>
                <input
                  type="number"
                  placeholder={`Default: ₹${summary?.total_expenses || 0}`}
                  value={totalExpenseOverride}
                  onChange={(e) => setTotalExpenseOverride(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProfitForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded shadow-xs"
              >
                Calculate & Save Harvest
              </button>
            </div>
          </form>
        )}

        {/* Expenses List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Amount (₹)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">No operational expenses logged for this farm.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{exp.expense_date}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">{exp.category}</span></td>
                    <td className="p-3 text-slate-700">{exp.description}</td>
                    <td className="p-3 font-bold text-slate-900">₹{exp.amount}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => exp.id && handleDeleteExpense(exp.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Harvest Profitability Records Table */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-green-700" /> Harvest Profitability Records
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Harvest Date</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Yield (kg)</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Total Revenue</th>
                <th className="p-3">Total Expenses</th>
                <th className="p-3">Net Profit</th>
                <th className="p-3">Profit / Acre</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profitRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-500">No harvest profitability records calculated yet.</td>
                </tr>
              ) : (
                profitRecords.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{pr.harvest_date}</td>
                    <td className="p-3 font-semibold text-slate-800">{pr.crop_name}</td>
                    <td className="p-3">{pr.production_qty_kg} kg</td>
                    <td className="p-3">₹{pr.selling_price_per_kg} / kg</td>
                    <td className="p-3 font-bold text-slate-900">₹{pr.revenue}</td>
                    <td className="p-3 text-slate-700">₹{pr.total_expenses}</td>
                    <td className="p-3 font-bold text-green-700">₹{pr.net_profit}</td>
                    <td className="p-3 font-semibold text-blue-700">₹{pr.profit_per_acre}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => pr.id && handleDeleteProfitRecord(pr.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
