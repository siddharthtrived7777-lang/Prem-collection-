/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Product, Bill, ActiveTab, BillItem, DiscountType } from './types';
import { INITIAL_PRODUCTS, INITIAL_BILLS } from './data/initialData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { InventoryView } from './components/InventoryView';
import { BillHistoryView } from './components/BillHistoryView';
import { BillReceiptModal } from './components/BillReceiptModal';
import { ProductFormModal } from './components/ProductFormModal';
import { Check, Info, X } from 'lucide-react';

export default function App() {
  // Pure React state as requested (no localStorage / sessionStorage)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [selectedBillForModal, setSelectedBillForModal] = useState<Bill | null>(
    null
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // User notification toast
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type?: 'success' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  const LOW_STOCK_THRESHOLD = 5;

  // Compute low stock count for badges
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= LOW_STOCK_THRESHOLD).length;
  }, [products]);

  // Generate Next Bill Number (e.g. PC-1004)
  const getNextBillId = (): string => {
    const billNumbers = bills
      .map((b) => {
        const match = b.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter((n) => !isNaN(n));

    const highest = billNumbers.length > 0 ? Math.max(...billNumbers) : 1000;
    return `PC-${highest + 1}`;
  };

  // 1. Save Bill & Auto-Reduce Stock Quantity
  const handleSaveBill = (billData: {
    customerName: string;
    customerPhone: string;
    items: BillItem[];
    subtotal: number;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
    total: number;
  }) => {
    const newBillId = getNextBillId();
    const newBill: Bill = {
      id: newBillId,
      createdAt: new Date().toISOString(),
      customerName: billData.customerName,
      customerPhone: billData.customerPhone,
      items: billData.items,
      subtotal: billData.subtotal,
      discountType: billData.discountType,
      discountValue: billData.discountValue,
      discountAmount: billData.discountAmount,
      total: billData.total,
      status: 'completed',
    };

    // Auto-reduce stock for each sold item
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const soldItem = billData.items.find((i) => i.productId === prod.id);
        if (soldItem) {
          const updatedStock = Math.max(0, prod.stockQuantity - soldItem.quantity);
          return {
            ...prod,
            stockQuantity: updatedStock,
          };
        }
        return prod;
      })
    );

    // Add bill to history
    setBills((prev) => [newBill, ...prev]);

    // Open receipt modal immediately for staff to send WhatsApp or print
    setSelectedBillForModal(newBill);

    showToast(`Bill #${newBillId} created! Inventory stock updated.`);
  };

  // 2. Undo / Void Bill & Auto-Restore Stock
  const handleUndoBill = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill || targetBill.status === 'cancelled') return;

    // Restore stock quantities
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const returnedItem = targetBill.items.find((i) => i.productId === prod.id);
        if (returnedItem) {
          return {
            ...prod,
            stockQuantity: prod.stockQuantity + returnedItem.quantity,
          };
        }
        return prod;
      })
    );

    // Update bill status to cancelled
    const updatedBill: Bill = {
      ...targetBill,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? updatedBill : b))
    );

    setSelectedBillForModal(updatedBill);
    showToast(`Bill #${billId} cancelled. Stock restored to inventory.`, 'info');
  };

  // 3. Add or Edit Product
  const handleSaveProduct = (
    productData: Omit<Product, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === existingId
            ? { ...productData, id: existingId, createdAt: p.createdAt }
            : p
        )
      );
      showToast(`Product "${productData.name}" updated successfully.`);
    } else {
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Added "${productData.name}" to inventory.`);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // 4. Delete Product
  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(
      `Product ${target ? `"${target.name}"` : ''} deleted from inventory.`,
      'info'
    );
  };

  // 5. Direct Stock Adjustment
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stockQuantity: newStock } : p
      )
    );
  };

  const handleQuickRestock = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = p.stockQuantity + amount;
          showToast(`Restocked ${p.name} (+${amount} units). Total: ${updated}`);
          return { ...p, stockQuantity: updated };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans text-stone-900 pb-20 md:pb-8 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Boutique Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        onOpenNewBill={() => setActiveTab('billing')}
      />

      {/* Sub-Navigation (Tabs) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            products={products}
            bills={bills}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectBill={(bill) => setSelectedBillForModal(bill)}
            onQuickRestock={handleQuickRestock}
            lowStockThreshold={LOW_STOCK_THRESHOLD}
          />
        )}

        {activeTab === 'billing' && (
          <BillingView
            products={products}
            onSaveBill={handleSaveBill}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onOpenAddModal={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenEditModal={(product) => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
            onAddProductToBill={(product) => {
              setActiveTab('billing');
            }}
            lowStockThreshold={LOW_STOCK_THRESHOLD}
          />
        )}

        {activeTab === 'history' && (
          <BillHistoryView
            bills={bills}
            onSelectBill={(bill) => setSelectedBillForModal(bill)}
            onUndoBill={handleUndoBill}
            onNavigateToBilling={() => setActiveTab('billing')}
          />
        )}
      </main>

      {/* Bill Receipt Modal (Print & WhatsApp) */}
      <BillReceiptModal
        bill={selectedBillForModal}
        onClose={() => setSelectedBillForModal(null)}
        onUndoBill={handleUndoBill}
        onNewBillAfterSave={() => {
          setSelectedBillForModal(null);
          setActiveTab('billing');
        }}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          id="app-toast-alert"
          className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 text-stone-100 px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs sm:text-sm max-w-sm"
        >
          {toast.type === 'info' ? (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
