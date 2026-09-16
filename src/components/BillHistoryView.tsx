import React, { useState, useMemo } from 'react';
import {
  Search,
  Receipt,
  Calendar,
  Phone,
  User,
  Send,
  Eye,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Bill } from '../types';
import {
  formatCurrency,
  generateWhatsAppLink,
  cleanPhoneNumber,
} from '../utils/whatsapp';

interface BillHistoryViewProps {
  bills: Bill[];
  onSelectBill: (bill: Bill) => void;
  onUndoBill?: (billId: string) => void;
  onNavigateToBilling: () => void;
}

export const BillHistoryView: React.FC<BillHistoryViewProps> = ({
  bills,
  onSelectBill,
  onUndoBill,
  onNavigateToBilling,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredBills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const today = new Date();
    const todayStr = today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return bills.filter((b) => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      // Date filter
      const bDateStr = new Date(b.createdAt).toDateString();
      if (dateFilter === 'today' && bDateStr !== todayStr) return false;
      if (dateFilter === 'yesterday' && bDateStr !== yesterdayStr) return false;

      // Search query (customer name, phone, or bill id)
      if (!q) return true;
      const cleanPhone = b.customerPhone.replace(/\D/g, '');
      const cleanQ = q.replace(/\D/g, '');

      return (
        b.id.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        (cleanQ && cleanPhone.includes(cleanQ))
      );
    });
  }, [bills, searchQuery, dateFilter, statusFilter]);

  const activeBills = bills.filter((b) => b.status === 'completed');
  const totalCompletedRevenue = activeBills.reduce((acc, b) => acc + b.total, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Stats summary */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Bill History & Register
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Review past customer receipts, print invoices, and send WhatsApp receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-amber-900">
                {formatCurrency(totalCompletedRevenue)}
              </span>
            </div>
            <button
              onClick={onNavigateToBilling}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              + New Bill
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-2.5 text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="bill-history-search"
              type="text"
              placeholder="Search by customer name, phone, or bill # (e.g. PC-1001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200/70 px-1 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date & Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs">
              {(['all', 'today', 'yesterday'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                    dateFilter === d
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'completed' | 'cancelled')
              }
              className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bill List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-stone-800">
              No bills found
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No bills matching "${searchQuery}". Check customer phone or name.`
                : 'Create your first bill from the New Bill screen.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredBills.map((bill) => {
              const isCancelled = bill.status === 'cancelled';
              const waLink = generateWhatsAppLink(bill, 'Prem Collection');
              const totalItems = bill.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              const dateFormatted = new Date(bill.createdAt).toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              );
              const timeFormatted = new Date(bill.createdAt).toLocaleTimeString(
                'en-IN',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }
              );

              return (
                <div
                  key={bill.id}
                  onClick={() => onSelectBill(bill)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors cursor-pointer group ${
                    isCancelled ? 'bg-stone-50/70 hover:bg-stone-100/60' : 'hover:bg-amber-50/40'
                  }`}
                >
                  {/* Left: Bill ID, Date & Customer */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCancelled
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Receipt className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          #{bill.id}
                        </span>

                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded-full bg-red-100 text-red-700 font-semibold border border-red-200">
                            <XCircle className="w-3 h-3" />
                            <span>Void / Cancelled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid</span>
                          </span>
                        )}

                        <span className="text-xs text-stone-400 font-sans">
                          {dateFormatted} at {timeFormatted}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1.5">
                        <span className="flex items-center gap-1 font-medium text-stone-800">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          {bill.customerName || 'Walk-in Customer'}
                        </span>

                        {bill.customerPhone && (
                          <span className="flex items-center gap-1 font-mono text-stone-600">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {bill.customerPhone}
                          </span>
                        )}

                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500">
                          {totalItems} {totalItems === 1 ? 'garment' : 'garments'}
                        </span>
                      </div>

                      {/* Line preview */}
                      <p className="text-xs text-stone-400 mt-1 truncate max-w-md">
                        {bill.items
                          .map((i) => `${i.name} (x${i.quantity})`)
                          .join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amounts & Quick WhatsApp Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      <div
                        className={`font-mono text-base sm:text-lg font-bold ${
                          isCancelled ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {formatCurrency(bill.total)}
                      </div>
                      {bill.discountAmount > 0 && !isCancelled && (
                        <span className="text-[11px] text-amber-700 font-medium block">
                          Saved ₹{bill.discountAmount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Direct WhatsApp Action Button */}
                      {bill.customerPhone && (
                        <a
                          id={`bill-wa-btn-${bill.id}`}
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Send receipt to customer via WhatsApp"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}

                      {/* View Receipt */}
                      <button
                        type="button"
                        onClick={() => onSelectBill(bill)}
                        title="View Full Bill Receipt"
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>
            Total: <strong>{filteredBills.length}</strong> bills recorded
          </span>
          <span className="text-stone-400 text-[11px]">
            Tap any row to view itemized receipt & print
          </span>
        </div>
      </div>
    </div>
  );
};
