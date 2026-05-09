import React, { useState, useMemo } from 'react';
import { Calculator, Truck, Trash2, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function ProfitCalculator() {
  const [params, setParams] = useState({
    mandiPrice: 22.5,
    transportCostPerUnit: 2.5,
    wastagePercent: 5,
    profitMarginPercent: 20,
    unitsSold: 50,
  });

  const results = useMemo(() => {
    const landedCost = params.mandiPrice + params.transportCostPerUnit;
    const effectiveCost = landedCost / (1 - (params.wastagePercent / 100));
    const rrp = effectiveCost * (1 + (params.profitMarginPercent / 100));
    const grossRevenue = rrp * params.unitsSold;
    const netProfit = (rrp - effectiveCost) * params.unitsSold;
    const totalCost = effectiveCost * params.unitsSold;

    return {
      landedCost,
      effectiveCost,
      rrp,
      grossRevenue,
      netProfit,
      totalCost
    };
  }, [params]);

  const handleChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Calculator size={24} />
          </div>
          Pricing Intelligence
        </h2>

        <div className="space-y-5">
          {/* Mandi Price */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Price (Mandi)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={params.mandiPrice}
                onChange={(e) => handleChange('mandiPrice', Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl font-bold text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Transport */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Truck size={10} /> Transport / Unit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={params.transportCostPerUnit}
                  onChange={(e) => handleChange('transportCostPerUnit', Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Wastage */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Trash2 size={10} /> Wastage %
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={params.wastagePercent}
                  onChange={(e) => handleChange('wastagePercent', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} /> Target Profit Margin
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={params.profitMarginPercent}
                onChange={(e) => handleChange('profitMarginPercent', Number(e.target.value))}
                className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <span className="w-12 text-right font-black text-indigo-600 font-mono text-sm">{params.profitMarginPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* RRP Display */}
      <motion.div 
        layout
        className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 border border-slate-800"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Suggested Selling Price / RRP</span>
          <Info size={14} className="text-slate-500" />
        </div>
        <div className="text-5xl font-black text-indigo-400 mb-2">
          {formatCurrency(results.rrp)}
          <span className="text-lg font-bold text-slate-500 ml-2">/ kg</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold bg-white/5 p-2 rounded-lg">
          <span className="text-green-400">+{params.profitMarginPercent}% Margin Included</span>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Cost (Effective)</span>
          <div className="text-lg font-black text-slate-800">{formatCurrency(results.effectiveCost)}</div>
          <p className="text-[8px] text-slate-400 leading-tight mt-1 uppercase font-bold">Includes transport & wastage</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Net Profit (Target)</span>
          <div className="text-lg font-black text-indigo-600">{formatCurrency(results.rrp - results.effectiveCost)}</div>
          <p className="text-[8px] text-indigo-400 leading-tight mt-1 uppercase font-bold">Per unit profit</p>
        </div>
      </div>

      {/* Educational Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-4 flex items-center gap-2">
          Know Your Profits
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500">Gross Sales</span>
              <span className="text-[10px] text-slate-400 uppercase font-black">All money collected</span>
            </div>
            <span className="text-lg font-black text-slate-800">{formatCurrency(results.grossRevenue)}</span>
          </div>
          <div className="flex items-center justify-between text-red-500">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Total Expenses</span>
              <span className="text-[10px] uppercase font-black opacity-70">Purchase + Costs</span>
            </div>
            <span className="text-lg font-black">{formatCurrency(results.totalCost)}</span>
          </div>
          <div className="pt-4 border-t flex items-center justify-between text-green-600 bg-green-50 -mx-6 px-6 -mb-6 rounded-b-3xl py-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Net Profit</span>
              <span className="text-[10px] uppercase font-black opacity-70">Actual money saved</span>
            </div>
            <span className="text-2xl font-black">{formatCurrency(results.netProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
