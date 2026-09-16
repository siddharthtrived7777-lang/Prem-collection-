import React, { useState, useEffect } from 'react';
import { ShoppingBag, PlusCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  onOpenNewBill: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  onOpenNewBill,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo & Shop Brand */}
          <div
            id="brand-logo-button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-inner ring-1 ring-amber-400/30">
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-amber-50 leading-none">
                  Prem Collection
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Shop Counter
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans tracking-wide mt-0.5">
                Kids • Men&apos;s • Women&apos;s Wear
              </p>
            </div>
          </div>

          {/* Center Info: Live Counter Date/Time */}
          <div className="hidden lg:flex items-center gap-3 bg-stone-800/80 px-3.5 py-1.5 rounded-lg border border-stone-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-stone-300 font-medium">{date}</span>
            <span className="text-stone-500">•</span>
            <span className="text-amber-200 font-mono tracking-wider">{time}</span>
          </div>

          {/* Right Actions: Low stock alert badge + Quick New Bill CTA */}
          <div className="flex items-center gap-2.5">
            {lowStockCount > 0 && (
              <button
                id="header-low-stock-btn"
                onClick={() => setActiveTab('inventory')}
                title={`${lowStockCount} items low in stock`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Low Stock:</span>
                <span className="bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full font-bold text-[11px]">
                  {lowStockCount}
                </span>
              </button>
            )}

            <button
              id="header-create-bill-btn"
              onClick={onOpenNewBill}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-sm ${
                activeTab === 'billing'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Bill</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
