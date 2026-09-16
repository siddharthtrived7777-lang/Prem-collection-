import React from 'react';
import { LayoutDashboard, Receipt, Package, History } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lowStockCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'billing' as ActiveTab,
      label: 'New Bill',
      icon: Receipt,
      badge: null,
      highlight: true,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Products',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Bill History',
      icon: History,
      badge: null,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Sub-Nav Bar */}
      <nav aria-label="Main Navigation" className="bg-white border-b border-stone-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-900 text-white shadow-sm'
                      : item.highlight
                      ? 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Bar for easy counter thumb access */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors ${
                  isActive
                    ? item.highlight
                      ? 'text-amber-700 bg-amber-50 font-bold'
                      : 'text-stone-900 bg-stone-100 font-bold'
                    : 'text-stone-500 hover:text-stone-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== null && (
                    <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
