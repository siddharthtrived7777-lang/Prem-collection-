import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Phone,
  Tag,
  Percent,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Product, BillItem, DiscountType, ProductCategory } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface BillingViewProps {
  products: Product[];
  onSaveBill: (billData: {
    customerName: string;
    customerPhone: string;
    items: BillItem[];
    subtotal: number;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
    total: number;
  }) => void;
  onNavigateToInventory?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  onSaveBill,
  onNavigateToInventory,
}) => {
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Cart / Bill items
  const [cartItems, setCartItems] = useState<BillItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Discount
  const [discountType, setDiscountType] = useState<DiscountType>('flat');
  const [discountValue, setDiscountValue] = useState<number | ''>(0);

  // Error feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered products for typeahead search
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCat) return false;

      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery, selectedCategory]);

  // Calculate Subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [cartItems]);

  // Calculate Discount Amount
  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (val <= 0 || subtotal <= 0) return 0;

    if (discountType === 'percentage') {
      const percentage = Math.min(val, 100);
      return Math.round((subtotal * percentage) / 100);
    } else {
      return Math.min(val, subtotal);
    }
  }, [discountType, discountValue, subtotal]);

  // Grand Total
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Add Item to Cart
  const handleAddItem = (product: Product) => {
    setErrorMessage(null);

    // Check if out of stock
    if (product.stockQuantity <= 0) {
      setErrorMessage(`"${product.name}" is currently out of stock.`);
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty >= product.stockQuantity) {
          setErrorMessage(
            `Cannot add more! Only ${product.stockQuantity} units available in stock.`
          );
          return prev;
        }
        const updated = [...prev];
        const newQty = currentQty + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: newQty * updated[existingIndex].unitPrice,
        };
        return updated;
      } else {
        const newItem: BillItem = {
          productId: product.id,
          name: product.name,
          category: product.category,
          size: product.size,
          color: product.color,
          unitPrice: product.price,
          quantity: 1,
          lineTotal: product.price,
        };
        return [newItem, ...prev];
      }
    });

    // Clear search for fast repeat entry
    setSearchQuery('');
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    setErrorMessage(null);
    const product = products.find((p) => p.id === productId);
    const maxStock = product ? product.stockQuantity : 999;

    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    if (newQty > maxStock) {
      setErrorMessage(
        `Maximum available stock for this item is ${maxStock} units.`
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQty,
            lineTotal: newQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear all items from this bill?')) {
      setCartItems([]);
      setDiscountValue(0);
      setErrorMessage(null);
    }
  };

  // Save Bill
  const handleSaveAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Please add at least one item to the bill.');
      return;
    }

    // Check if any item exceeds current stock
    for (const item of cartItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && item.quantity > prod.stockQuantity) {
        setErrorMessage(
          `Cannot save: Item "${item.name}" exceeds remaining stock (${prod.stockQuantity} available).`
        );
        return;
      }
    }

    onSaveBill({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cartItems,
      subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount,
      total: grandTotal,
    });

    // Reset form after saving
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountValue(0);
    setSearchQuery('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Error alert toast */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-xl text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-red-700 hover:text-red-900 underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left is Inventory Search & Cart; Right is Bill Summary & Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Customer Info, Fast Search & Active Bill Items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-amber-700" />
              <h3 className="font-semibold text-stone-900 text-sm">
                Customer Information (Optional)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1"
                >
                  Customer Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1"
                >
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="customer-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  10-digit number for instant WhatsApp invoice delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Product Fast Search & Typeahead */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-700" />
                <h3 className="font-semibold text-stone-900 text-sm">
                  Add Garments to Bill
                </h3>
              </div>

              {/* Category Quick Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Kids', 'Men', 'Women'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                id="billing-product-search"
                type="text"
                placeholder="Search by garment name, color, size, or category..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200/80 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Fast Product Suggestions Grid / List */}
            <div className="mt-3 max-h-[220px] overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl">
              {products.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500">
                  <ShoppingBag className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-stone-700">No products in inventory yet</p>
                  <p className="text-stone-400 mt-0.5">Please add products under the Inventory tab to start billing.</p>
                  {onNavigateToInventory && (
                    <button
                      type="button"
                      onClick={onNavigateToInventory}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                    >
                      <span>Go to Inventory & Add Products</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  No matching products found. Try a different keyword or category.
                </div>
              ) : (
                filteredProducts.slice(0, 8).map((product) => {
                  const isOutOfStock = product.stockQuantity <= 0;
                  const inCartQty =
                    cartItems.find((i) => i.productId === product.id)?.quantity || 0;
                  const remainingStock = product.stockQuantity - inCartQty;

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddItem(product)}
                      className={`p-2.5 sm:p-3 flex items-center justify-between transition-colors gap-2 ${
                        isOutOfStock
                          ? 'opacity-50 bg-stone-50 cursor-not-allowed'
                          : 'hover:bg-amber-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                              product.category === 'Kids'
                                ? 'bg-orange-100 text-orange-800'
                                : product.category === 'Men'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {product.category}
                          </span>
                          <span className="text-sm font-medium text-stone-900 truncate">
                            {product.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          <span>Size: <strong>{product.size}</strong></span>
                          <span>•</span>
                          <span>{product.color}</span>
                          <span>•</span>
                          <span className="font-mono text-stone-800 font-semibold">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : remainingStock <= 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {isOutOfStock
                            ? 'Out of stock'
                            : `${remainingStock} in stock`}
                        </span>

                        <button
                          type="button"
                          disabled={isOutOfStock || remainingStock <= 0}
                          className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            isOutOfStock || remainingStock <= 0
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-2xs'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Bill Items Table */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <h3 className="font-semibold text-stone-900 text-sm">
                  Active Bill Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                </h3>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-stone-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">
                  Bill is empty
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Use the product search above or pick from inventory to start billing.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-left">
                      <th className="pb-2 font-semibold">Item & Details</th>
                      <th className="pb-2 font-semibold text-right">Price</th>
                      <th className="pb-2 font-semibold text-center">Quantity</th>
                      <th className="pb-2 font-semibold text-right">Total</th>
                      <th className="pb-2 font-semibold text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                      <tr key={item.productId} className="py-2.5">
                        {/* Name & details */}
                        <td className="py-3 pr-2">
                          <div className="font-medium text-stone-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-stone-700">
                              {item.category}
                            </span>
                            <span>•</span>
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>{item.color}</span>
                          </div>
                        </td>

                        {/* Unit price */}
                        <td className="py-3 text-right font-mono text-stone-700">
                          ₹{item.unitPrice}
                        </td>

                        {/* Quantity Stepper */}
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center border border-stone-300 rounded-lg bg-stone-50">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Line total */}
                        <td className="py-3 text-right font-mono font-bold text-stone-900">
                          ₹{item.lineTotal}
                        </td>

                        {/* Remove item */}
                        <td className="py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Settlement & Bill Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs sticky top-22">
            <h3 className="font-semibold text-stone-900 text-base pb-3 border-b border-stone-200">
              Bill Summary
            </h3>

            {/* Summary Details */}
            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Total Items:</span>
                <span className="font-mono font-semibold text-stone-900">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} units
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-stone-900">
                  ₹{subtotal}
                </span>
              </div>

              {/* Discount Section */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Discount
                  </span>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`px-2 py-0.5 rounded font-medium transition-all ${
                        discountType === 'flat'
                          ? 'bg-white text-stone-900 shadow-2xs font-bold'
                          : 'text-stone-500'
                      }`}
                    >
                      Flat ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-2 py-0.5 rounded font-medium transition-all ${
                        discountType === 'percentage'
                          ? 'bg-white text-stone-900 shadow-2xs font-bold'
                          : 'text-stone-500'
                      }`}
                    >
                      % Off
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs text-stone-400 font-mono">
                      {discountType === 'flat' ? '₹' : '%'}
                    </span>
                    <input
                      id="bill-discount-input"
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : subtotal}
                      placeholder="0"
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="w-full pl-7 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Quick percentage shortcuts */}
                  {discountType === 'percentage' && (
                    <div className="flex gap-1">
                      {[5, 10, 15].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountValue(pct)}
                          className="px-1.5 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-medium"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                    <span>Discount Applied:</span>
                    <span className="font-mono font-bold">-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-stone-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-stone-900">
                    Grand Total
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-amber-800">
                      {formatCurrency(grandTotal)}
                    </span>
                    <p className="text-[11px] text-stone-400">
                      Plain Net Bill (No Tax)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Generate Bill Action Button */}
            <button
              id="save-generate-bill-btn"
              type="button"
              disabled={cartItems.length === 0}
              onClick={handleSaveAndGenerate}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                cartItems.length === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Save & Generate Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Helpful Helper note */}
            <p className="text-[11px] text-stone-400 text-center mt-3">
              Stock automatically deducts upon saving. WhatsApp invoice popup appears immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
