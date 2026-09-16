import React, { useState } from 'react';
import {
  X,
  Send,
  Printer,
  Copy,
  Check,
  RotateCcw,
  ShoppingBag,
  Clock,
  User,
  Phone,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Bill } from '../types';
import {
  formatCurrency,
  generateWhatsAppLink,
  generateWhatsAppMessageText,
} from '../utils/whatsapp';

interface BillReceiptModalProps {
  bill: Bill | null;
  onClose: () => void;
  onUndoBill?: (billId: string) => void;
  onNewBillAfterSave?: () => void;
}

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({
  bill,
  onClose,
  onUndoBill,
  onNewBillAfterSave,
}) => {
  const [copied, setCopied] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  if (!bill) return null;

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessageText(bill, 'Prem Collection');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const waLink = generateWhatsAppLink(bill, 'Prem Collection');

  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="receipt-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Controls (No-Print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-stone-900 text-stone-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Bill #{bill.id}
            </span>
            {bill.status === 'cancelled' && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                Void / Cancelled
              </span>
            )}
          </div>
          <button
            id="close-receipt-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar (No-Print) */}
        <div className="no-print bg-stone-100/90 border-b border-stone-200 px-5 py-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Direct WhatsApp Send */}
            <a
              id="send-whatsapp-btn"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>

            {/* Copy Text */}
            <button
              id="copy-whatsapp-btn"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print</span>
            </button>
          </div>

          {/* Undo Bill Button */}
          {onUndoBill && bill.status !== 'cancelled' && (
            <div>
              {!showUndoConfirm ? (
                <button
                  id="undo-bill-init-btn"
                  onClick={() => setShowUndoConfirm(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium border border-transparent hover:border-red-200 transition-colors"
                  title="Cancel this bill and restore inventory stock"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Void / Undo</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  <span className="text-[11px] text-red-800 font-medium">
                    Restore stock?
                  </span>
                  <button
                    id="confirm-undo-bill-btn"
                    onClick={() => {
                      onUndoBill(bill.id);
                      setShowUndoConfirm(false);
                    }}
                    className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                  >
                    Yes, Void
                  </button>
                  <button
                    onClick={() => setShowUndoConfirm(false)}
                    className="px-1.5 py-0.5 text-stone-600 text-[11px] hover:text-stone-900"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Printable Receipt Paper */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-stone-50">
          <div
            id="printable-receipt"
            className="bg-white border border-stone-200 p-6 sm:p-7 rounded-xl shadow-xs font-sans text-stone-900 relative"
          >
            {bill.status === 'cancelled' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className="text-red-500/20 font-black text-6xl rotate-[-25deg] tracking-widest border-4 border-red-500/20 px-6 py-2 rounded-xl">
                  CANCELLED
                </span>
              </div>
            )}

            {/* Shop Header */}
            <div className="text-center pb-4 border-b border-dashed border-stone-300">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-800 mb-1.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                Prem Collection
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Clothing Store • Kids, Men & Women
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Internal Counter Invoice
              </p>
            </div>

            {/* Bill Details Metadata */}
            <div className="py-3.5 border-b border-stone-200 text-xs text-stone-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Bill Number:</span>
                <span className="font-mono font-bold text-stone-900">
                  #{bill.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Date & Time:</span>
                <span className="text-stone-800">
                  {formattedDate}, {formattedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Customer:</span>
                <span className="font-medium text-stone-900">
                  {bill.customerName || 'Walk-in Customer'}
                </span>
              </div>
              {bill.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Phone:</span>
                  <span className="font-mono text-stone-800">
                    {bill.customerPhone}
                  </span>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="text-left font-semibold pb-2">Item</th>
                    <th className="text-center font-semibold pb-2">Qty</th>
                    <th className="text-right font-semibold pb-2">Rate</th>
                    <th className="text-right font-semibold pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bill.items.map((item, idx) => (
                    <tr key={`${item.productId}-${idx}`} className="py-2">
                      <td className="py-2 pr-2">
                        <div className="font-medium text-stone-900">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-500 flex gap-1.5 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>Size: {item.size}</span>
                          <span>•</span>
                          <span>{item.color}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center text-stone-700 font-medium align-top">
                        {item.quantity}
                      </td>
                      <td className="py-2 text-right text-stone-600 align-top">
                        ₹{item.unitPrice}
                      </td>
                      <td className="py-2 text-right font-medium text-stone-900 align-top">
                        ₹{item.lineTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="pt-3 border-t border-dashed border-stone-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({bill.items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                <span className="font-medium">₹{bill.subtotal}</span>
              </div>

              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>
                    Discount{' '}
                    {bill.discountType === 'percentage'
                      ? `(${bill.discountValue}%)`
                      : '(Flat)'}
                    :
                  </span>
                  <span>-₹{bill.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total:</span>
                <span className="font-mono text-amber-800 text-lg">
                  {formatCurrency(bill.total)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-5 mt-4 border-t border-dashed border-stone-200 text-stone-500 text-[11px]">
              <p className="font-medium text-stone-700">
                Thank you for shopping with us!
              </p>
              <p className="mt-0.5">Please visit Prem Collection again.</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions (No-Print) */}
        <div className="no-print px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            {bill.customerPhone ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" /> WhatsApp ready ({bill.customerPhone})
              </span>
            ) : (
              <span className="text-stone-400 italic">No phone number provided</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onNewBillAfterSave && (
              <button
                id="receipt-new-bill-btn"
                onClick={() => {
                  onClose();
                  onNewBillAfterSave();
                }}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                + New Bill
              </button>
            )}
            <button
              id="receipt-done-btn"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
