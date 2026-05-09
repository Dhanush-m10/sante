import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { CommodityPrice } from '../types';
import { BrainCircuit, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const getMockPrices = (market: string): CommodityPrice[] => [
  { id: 'v1', commodity: 'Onion', mandiPrice: 22.5, unit: 'kg', market, updatedAt: '', trend: 'up' as const, history: [20, 21, 19, 22, 21, 13, 22.5] },
  { id: 'v2', commodity: 'Tomato', mandiPrice: 18.0, unit: 'kg', market, updatedAt: '', trend: 'down' as const, history: [22, 20, 21, 19, 18.5, 18.2, 18.0] },
  { id: 'f1', commodity: 'Apple', mandiPrice: 85.0, unit: 'kg', market, updatedAt: '', trend: 'up' as const, history: [75, 78, 80, 82, 80, 84, 85] },
  { id: 'f2', commodity: 'Banana', mandiPrice: 35.0, unit: 'doz', market, updatedAt: '', trend: 'stable' as const, history: [34, 35, 35, 36, 35, 35, 35] },
  { id: 'f4', commodity: 'Mango', mandiPrice: 140.0, unit: 'kg', market, updatedAt: '', trend: 'up' as const, history: [110, 115, 120, 130, 125, 135, 140] },
];

export default function Trends() {
  const { userMarket } = useAuth();
  const mockPrices = getMockPrices(userMarket);
  const [selected, setSelected] = useState(mockPrices[0]);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Update selected if userMarket changes
  useEffect(() => {
    setSelected(getMockPrices(userMarket)[0]);
  }, [userMarket]);

  const data = selected.history.map((val, i) => ({
    day: `Day ${i + 1}`,
    price: val
  }));

  const fetchAiPrediction = async (commodity: string, history: number[]) => {
    setLoadingPrediction(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the last 7 days of wholesale Mandi prices for ${commodity}: ${history.join(', ')}. 
        Provide a very brief 1-sentence prediction for tomorrow's price movement in a style suitable for a small vendor. 
        Focus on 'Rise', 'Fall', or 'Stable'. Keep it under 20 words.`,
      });
      setPrediction(response.text || "Market stable. No significant change expected.");
    } catch (error) {
      console.error(error);
      setPrediction("Prediction unavailable. Check Mandi news.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    fetchAiPrediction(selected.commodity, selected.history);
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
        {mockPrices.map(item => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all whitespace-nowrap ${
              selected.id === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {item.commodity}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">7-Day Analysis</h2>
          <div className="flex items-center gap-1">
            {selected.trend === 'up' ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-green-500" />}
            <span className={`text-[10px] font-black uppercase ${selected.trend === 'up' ? 'text-red-500' : 'text-green-600'}`}>
              {selected.trend} Trend
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                hide 
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => [`₹${value}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#4f46e5' }} 
                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-4">
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Start</div>
            <div className="font-black text-slate-800">₹{selected.history[0]}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Current</div>
            <div className="font-black text-slate-800">₹{selected.mandiPrice}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Diff</div>
            <div className={`font-black ${selected.mandiPrice > selected.history[0] ? 'text-red-500' : 'text-green-600'}`}>
              {selected.mandiPrice > selected.history[0] ? '+' : ''}{Math.round((selected.mandiPrice - selected.history[0]) * 10) / 10}
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 shadow-sm"
      >
        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
          {loadingPrediction ? <Loader2 size={24} className="animate-spin" /> : <BrainCircuit size={24} />}
        </div>
        <div>
          <h3 className="text-sm font-black uppercase text-indigo-600 mb-1">AI Prediction</h3>
          {loadingPrediction ? (
            <div className="h-4 w-32 bg-indigo-200 animate-pulse rounded" />
          ) : (
            <p className="text-sm text-indigo-900 font-medium italic">
              "{prediction}"
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
