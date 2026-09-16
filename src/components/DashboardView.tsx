import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  AlertTriangle,
  ShoppingBag,
  PlusCircle,
  Package,
  ArrowUpRight,
  Send,
  Eye,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Bill, Product, ActiveTab } from '../types';
import { formatCurrency, generateWhatsAppLink } from '../utils/whatsapp';

interface DashboardViewProps {
  products: Product[];
  bills: Bill[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectBill: (bill: Bill) => void;
  onQuickRestock: (productId: string, amount: number) => void;
  lowStockThreshold?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  bills,
  onNavigate,
  onSelectBill,
  onQuickRestock,
  lowStockThreshold = 5,
}) => {
  const [threshold, setThreshold] = useState<number>(lowStockThreshold);

  // Compute Today's metrics
  const todayDateString = new Date().toDateString();

  const todayBills = bills.filter((b) => {
    if (b.status === 'cancelled') return false;
    return new Date(b.createdAt).toDateString() === todayDateString;
  });

  const todayTotalSales = todayBills.reduce((acc, b) => acc + b.total, 0);
  const todayItemsSold = todayBills.reduce(
    (acc, b) => acc + b.items.reduce((s, item) => s + item.quantity, 0),
    0
  );
  const averageTicket =
    todayBills.length > 0 ? Math.round(todayTotalSales / todayBills.length) : 0;

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stockQuantity <= threshold);

  // Category distribution
  const totalProducts = products.length;
  const kidsCount = products.filter((p) => p.category === 'Kids').length;
  const menCount = products.filter((p) => p.category === 'Men').length;
  const womenCount = products.filter((p) => p.category === 'Women').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-5 sm:p-6 text-stone-100 shadow-md border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Counter Overview</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome to Prem Collection
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            Live shop-counter register. Fast billing, real-time stock deduction, and one-tap WhatsApp customer receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            id="dash-quick-bill-btn"
            onClick={() => onNavigate('billing')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bill</span>
          </button>
          <button
            id="dash-quick-product-btn"
            onClick={() => onNavigate('inventory')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl font-medium text-sm transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Today Sales */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Today&apos;s Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-mono">
              {formatCurrency(todayTotalSales)}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              Active bill collections today
            </p>
          </div>
        </div>

        {/* Bills Made Today */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Bills Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-mono">
              {todayBills.length}
            </span>
            <span className="text-xs text-stone-500 ml-1.5 font-sans">bills</span>
            <p className="text-[11px] text-stone-500 mt-1">
              {todayItemsSold} total garments sold
            </p>
          </div>
        </div>

        {/* Average Bill Value */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Avg. Ticket
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-mono">
              {formatCurrency(averageTicket)}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">Per transaction average</p>
          </div>
        </div>

        {/* Low Stock Counter */}
        <div
          className={`rounded-xl p-4 sm:p-5 border shadow-2xs transition-colors ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-white border-stone-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                lowStockProducts.length > 0
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-amber-900 font-mono">
                {lowStockProducts.length}
              </span>
              <span className="text-xs text-amber-800 ml-1.5 font-medium">
                items ≤ {threshold} units
              </span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Requires re-ordering</p>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert List + Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Low Stock Alert List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
              <h3 className="font-semibold text-stone-900 text-base">
                Low-Stock Alert List
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {lowStockProducts.length}
              </span>
            </div>

            {/* Threshold Selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span>Threshold:</span>
              <select
                id="threshold-select"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value={3}>≤ 3 units</option>
                <option value={5}>≤ 5 units</option>
                <option value={8}>≤ 8 units</option>
                <option value={10}>≤ 10 units</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-stone-800">
                  Healthy Inventory Levels
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  No items below the {threshold} unit threshold.
                </p>
              </div>
            ) : (
              lowStockProducts.map((product) => {
                const isOutOfStock = product.stockQuantity === 0;
                return (
                  <div
                    key={product.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-stone-50 transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            product.category === 'Kids'
                              ? 'bg-orange-100 text-orange-800'
                              : product.category === 'Men'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {product.category}
                        </span>
                        <h4 className="text-sm font-medium text-stone-900 truncate">
                          {product.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span>Size: <strong className="text-stone-700">{product.size}</strong></span>
                        <span>•</span>
                        <span>{product.color}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-800 font-semibold">
                          ₹{product.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {product.stockQuantity} left
                        </span>
                      </div>

                      {/* Quick Restock Action Button */}
                      <button
                        id={`quick-restock-${product.id}`}
                        onClick={() => onQuickRestock(product.id, 5)}
                        title="Add +5 stock instantly"
                        className="p-1.5 rounded-lg border border-stone-300 hover:border-amber-600 text-stone-600 hover:text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-medium">+5</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-stone-50/80 border-t border-stone-100 text-center">
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
            >
              <span>View full inventory table ({totalProducts} products)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Today's Recent Bills (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900 text-base">
                Recent Bills
              </h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto">
              {bills.slice(0, 5).map((bill) => {
                const isCancelled = bill.status === 'cancelled';
                const waLink = generateWhatsAppLink(bill, 'Prem Collection');
                return (
                  <div
                    key={bill.id}
                    onClick={() => onSelectBill(bill)}
                    className="p-3.5 sm:p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          #{bill.id}
                        </span>
                        {isCancelled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-semibold">
                            Cancelled
                          </span>
                        )}
                        <span className="text-xs text-stone-500 truncate">
                          {bill.customerName || 'Walk-in'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-2">
                        <span>
                          {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>{bill.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {formatCurrency(bill.total)}
                      </span>
                      {bill.customerPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <div className="p-1.5 text-stone-400 group-hover:text-stone-700">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {bills.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  <p className="text-xs">No bills generated yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Category Summary Footer */}
          <div className="p-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-around text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              Kids: <strong>{kidsCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Men: <strong>{menCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Women: <strong>{womenCount}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
