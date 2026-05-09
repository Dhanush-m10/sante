import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Calculator, LayoutDashboard, LineChart, Tv, LogOut, ChevronDown, Users } from 'lucide-react';
import PriceWatch from './PriceWatch';
import ProfitCalculator from './ProfitCalculator';
import PriceBoard from './PriceBoard';
import Trends from './Trends';
import Community from './Community';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'watch' | 'calc' | 'board' | 'trends' | 'community';

const MARKETS = ['Bangalore', 'Mumbai', 'Chennai', 'Pune', 'Delhi'];

export default function Layout() {
  const [activeTab, setActiveTab] = useState<Tab>('watch');
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const { logout, userMarket, setUserMarket } = useAuth();

  const tabs = [
    { id: 'watch', label: 'Price Watch', icon: LayoutDashboard },
    { id: 'calc', label: 'Profit Calc', icon: Calculator },
    { id: 'trends', label: 'Trends', icon: LineChart },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'board', label: 'Price Board', icon: Tv },
  ];

  if (activeTab === 'board') {
    return <PriceBoard onBack={() => setActiveTab('watch')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-black tracking-tight text-indigo-600 flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">SP</div>
              Sante-Price
            </h1>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowMarketMenu(!showMarketMenu)}
              className="w-full flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Active Market: <strong className="text-indigo-600 uppercase tracking-wider ml-1">{userMarket}</strong></span>
              </div>
              <ChevronDown size={14} className={cn("transition-transform", showMarketMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showMarketMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMarketMenu(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                  >
                    {MARKETS.map(market => (
                      <button
                        key={market}
                        onClick={() => {
                          setUserMarket(market);
                          setShowMarketMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-xs font-bold transition-colors border-b last:border-0",
                          userMarket === market ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {market}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'watch' && (
            <motion.div
              key="watch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PriceWatch />
            </motion.div>
          )}
          {activeTab === 'calc' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfitCalculator />
            </motion.div>
          )}
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Trends />
            </motion.div>
          )}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Community />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-2 flex justify-around items-center max-w-md mx-auto z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-16",
                activeTab === tab.id 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
