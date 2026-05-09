import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CommodityPrice } from '../types';
import { ArrowLeft, ZoomIn, ZoomOut, Settings, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const getMockData = (market: string): CommodityPrice[] => [
  { id: 'v1', commodity: 'ONION', mandiPrice: 22.5, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [20, 21, 19, 22, 21, 23, 22.5] },
  { id: 'v2', commodity: 'TOMATO', mandiPrice: 18.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'down' as const, history: [22, 20, 21, 19, 18.5, 18.2, 18.0] },
  { id: 'v3', commodity: 'POTATO', mandiPrice: 14.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'stable' as const, history: [14, 14, 14.2, 13.8, 14, 14.1, 14] },
  { id: 'f1', commodity: 'APPLE', mandiPrice: 85.0, unit: 'kg', market, updatedAt: new Date().toISOString(), trend: 'up' as const, history: [75, 78, 80, 82, 80, 84, 85] },
];

interface PriceBoardProps {
  onBack: () => void;
}

export default function PriceBoard({ onBack }: PriceBoardProps) {
  const { userMarket } = useAuth();
  const [fontSize, setFontSize] = useState(48);
  const [showMandi, setShowMandi] = useState(false);
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [config, setConfig] = useState({
    transport: 2.5,
    wastage: 5,
    profit: 20
  });
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'prices'), 
      where('market', '==', userMarket),
      orderBy('commodity', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommodityPrice));
      if (docs.length > 0) {
        setPrices(docs);
      } else {
        setPrices(getMockData(userMarket));
      }
    }, (error) => {
      console.warn('PriceBoard fetch fallback:', error);
      setPrices(getMockData(userMarket));
    });

    return () => unsubscribe();
  }, [userMarket]);

  const calculatedPrices = useMemo(() => {
    return prices.map(item => {
      const landed = item.mandiPrice + config.transport;
      const effective = landed / (1 - (config.wastage / 100));
      const rrp = Math.ceil(effective * (1 + (config.profit / 100)));
      return { ...item, rrp };
    });
  }, [prices, config]);

  return (
    <div className="fixed inset-0 bg-black text-[#FFD600] z-50 flex flex-col font-black overflow-hidden h-screen select-none">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 absolute top-0 left-0 right-0 z-20 opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={onBack} className="p-3 bg-zinc-800 rounded-xl text-white">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMandi(!showMandi)} 
            className={cn("p-3 rounded-xl transition-colors", showMandi ? "bg-[#FFD600] text-black" : "bg-zinc-800 text-white")}
            title="Toggle Mandi Price"
          >
            {showMandi ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>
          <button 
            onClick={() => setShowConfig(!showConfig)} 
            className={cn("p-3 rounded-xl transition-colors", showConfig ? "bg-[#FFD600] text-black" : "bg-zinc-800 text-white")}
          >
            <Settings size={24} />
          </button>
          <div className="h-8 w-px bg-zinc-700 mx-2" />
          <button onClick={() => setFontSize(f => Math.max(24, f - 4))} className="p-3 bg-zinc-800 rounded-xl text-white">
            <ZoomOut size={24} />
          </button>
          <button onClick={() => setFontSize(f => Math.min(120, f + 4))} className="p-3 bg-zinc-800 rounded-xl text-white">
            <ZoomIn size={24} />
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="absolute top-20 left-4 right-4 bg-zinc-900 border-2 border-[#FFD600] p-6 rounded-3xl z-30 shadow-2xl space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase opacity-60">Transport</label>
              <input 
                type="number" 
                value={config.transport} 
                onChange={(e) => setConfig({...config, transport: Number(e.target.value)})}
                className="w-full bg-black border border-zinc-700 p-2 rounded-lg text-[#FFD600] font-mono text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase opacity-60">Wastage %</label>
              <input 
                type="number" 
                value={config.wastage} 
                onChange={(e) => setConfig({...config, wastage: Number(e.target.value)})}
                className="w-full bg-black border border-zinc-700 p-2 rounded-lg text-[#FFD600] font-mono text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase opacity-60">Profit %</label>
              <input 
                type="number" 
                value={config.profit} 
                onChange={(e) => setConfig({...config, profit: Number(e.target.value)})}
                className="w-full bg-black border border-zinc-700 p-2 rounded-lg text-[#FFD600] font-mono text-center"
              />
            </div>
          </div>
          <button onClick={() => setShowConfig(false)} className="w-full bg-[#FFD600] text-black py-3 rounded-xl uppercase font-black tracking-widest">Done</button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto pt-24 px-8 pb-12">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.6em] opacity-60 uppercase mb-3">Live Retail Rates: {userMarket} Market</div>
          <div className="h-1.5 bg-[#FFD600] w-32 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-16">
          {calculatedPrices.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b-4 border-[#FFD600]/10 pb-12 last:border-0">
              <div className="col-span-6 flex flex-col">
                <span className="text-sm opacity-50 mb-1 uppercase tracking-widest">Commodity</span>
                <span className="leading-none tracking-tighter truncate uppercase" style={{ fontSize: `${fontSize}px` }}>
                  {item.commodity}
                </span>
              </div>
              
              {showMandi && (
                <div className="col-span-3 flex flex-col items-center">
                  <span className="text-sm opacity-50 mb-1 uppercase tracking-widest">Mandi</span>
                  <div className="flex flex-col items-center">
                    <span className="leading-none opacity-40 italic" style={{ fontSize: `${fontSize * 0.7}px` }}>
                      {Math.round(item.mandiPrice)}
                    </span>
                  </div>
                </div>
              )}

              <div className={cn("flex flex-col items-end", showMandi ? "col-span-3" : "col-span-6")}>
                <span className="text-sm opacity-50 mb-1 uppercase tracking-widest">Sale (₹/{item.unit})</span>
                <span className="leading-none tracking-tighter" style={{ fontSize: `${fontSize * 1.2}px` }}>
                  {item.rrp}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-20 text-center opacity-30 text-xs tracking-[0.4em] uppercase">
          Digital Rate Board • Sante-Price Index
        </div>
      </div>
    </div>
  );
}
