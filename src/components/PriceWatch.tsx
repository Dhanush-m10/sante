import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { CommodityPrice } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, MapPin } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const getMockData = (market: string, category: 'veg' | 'fruit'): CommodityPrice[] => {
  const veg: CommodityPrice[] = [
    { id: 'v1', commodity: 'Onion', mandiPrice: 22.5, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [20, 21, 19, 22, 21, 23, 22.5] },
    { id: 'v2', commodity: 'Tomato', mandiPrice: 18.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'down' as const, history: [22, 20, 21, 19, 18.5, 18.2, 18.0] },
    { id: 'v3', commodity: 'Potato', mandiPrice: 14.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'stable' as const, history: [14, 14, 14.2, 13.8, 14, 14.1, 14] },
    { id: 'v4', commodity: 'Green Chilli', mandiPrice: 45.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [40, 42, 41, 44, 43, 44, 45] },
    { id: 'v5', commodity: 'Garlic', mandiPrice: 120.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'stable' as const, history: [120, 118, 122, 120, 120, 121, 120] },
  ];

  const fruit: CommodityPrice[] = [
    { id: 'f1', commodity: 'Apple', mandiPrice: 85.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [75, 78, 80, 82, 80, 84, 85] },
    { id: 'f2', commodity: 'Banana', mandiPrice: 35.0, unit: 'doz', market, updatedAt: new Date().toISOString(), trend: 'stable' as const, history: [34, 35, 35, 36, 35, 35, 35] },
    { id: 'f3', commodity: 'Grapes', mandiPrice: 65.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'down' as const, history: [75, 72, 70, 68, 67, 66, 65] },
    { id: 'f4', commodity: 'Mango', mandiPrice: 140.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [110, 120, 125, 130, 135, 138, 140] },
    { id: 'f5', commodity: 'Orange', mandiPrice: 55.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'stable' as const, history: [54, 55, 56, 55, 55, 54, 55] },
  ];

  return category === 'veg' ? veg : fruit;
};

export default function PriceWatch() {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'veg' | 'fruit'>('veg');
  const { userMarket } = useAuth();

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'prices'), 
      where('market', '==', userMarket),
      where('category', '==', category),
      orderBy('commodity', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommodityPrice));
      if (docs.length > 0) {
        setPrices(docs);
      } else {
        // Fallback to mock data for selected market
        setPrices(getMockData(userMarket, category));
      }
      setLoading(false);
    }, (error) => {
      // If index is missing, it will error. For prototype, we fallback to mock data.
      console.warn('Firestore query failed or requires index:', error);
      setPrices(getMockData(userMarket, category));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userMarket, category]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">Mandi Rates</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setCategory('veg')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
              category === 'veg' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            Vegetables
          </button>
          <button 
            onClick={() => setCategory('fruit')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
              category === 'fruit' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            Fruits
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {prices.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.market} Market</span>
              <h3 className="text-xl font-black text-slate-800">{item.commodity}</h3>
              <div className="flex items-center gap-1 mt-1 text-slate-500 font-medium">
                <MapPin size={12} />
                <span className="text-[10px] uppercase font-bold tracking-tight">Main Mandi</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                {item.trend === 'up' && <TrendingUp size={14} className="text-red-500" />}
                {item.trend === 'down' && <TrendingDown size={14} className="text-green-500" />}
                {item.trend === 'stable' && <Minus size={14} className="text-slate-300" />}
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  item.trend === 'up' ? "text-red-500" : item.trend === 'down' ? "text-green-600" : "text-slate-400"
                )}>
                  {item.trend}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {formatCurrency(item.mandiPrice)}
                <span className="text-xs font-bold text-slate-400 ml-1 tracking-tight">/{item.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
        <h4 className="font-bold mb-1">💡 Smart Tip</h4>
        <p className="text-xs text-indigo-100 leading-relaxed">
          Garlic prices are expected to rise by 10% in the next 3 days due to supply shortages at Pune Mandi. Stock accordingly!
        </p>
      </div>
    </div>
  );
}
