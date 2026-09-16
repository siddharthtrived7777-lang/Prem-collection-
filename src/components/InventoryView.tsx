import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface InventoryViewProps {
  products: Product[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProductToBill?: (product: Product) => void;
  lowStockThreshold?: number;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onUpdateStock,
  onAddProductToBill,
  lowStockThreshold = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'in_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Stock status filter
        if (stockFilter === 'low') {
          if (p.stockQuantity > lowStockThreshold || p.stockQuantity === 0) return false;
        } else if (stockFilter === 'out_of_stock') {
          if (p.stockQuantity > 0) return false;
        } else if (stockFilter === 'in_stock') {
          if (p.stockQuantity === 0) return false;
        }

        // Search text filter
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'price') cmp = a.price - b.price;
        else if (sortBy === 'stock') cmp = a.stockQuantity - b.stockQuantity;

        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    stockFilter,
    sortBy,
    sortOrder,
    lowStockThreshold,
  ]);

  const toggleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const kidsCount = products.filter((p) => p.category === 'Kids').length;
  const menCount = products.filter((p) => p.category === 'Men').length;
  const womenCount = products.filter((p) => p.category === 'Women').length;
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= lowStockThreshold && p.stockQuantity > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Controls: Title + Search + Category + Add Product */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Product Inventory
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Manage clothing catalogue, sizes, colors, pricing, and live shop stock.
            </p>
          </div>

          <button
            id="add-product-main-btn"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-2.5 text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search products by name, size, color, or SKU..."
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'All', label: 'All Items', count: products.length },
              { id: 'Kids', label: 'Kids', count: kidsCount },
              { id: 'Men', label: "Men's", count: menCount },
              { id: 'Women', label: "Women's", count: womenCount },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`inventory-cat-${tab.id}`}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === tab.id
                    ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === tab.id
                      ? 'bg-stone-700 text-amber-200'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Stock Condition Filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              id="stock-filter-select"
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(
                  e.target.value as 'all' | 'low' | 'in_stock' | 'out_of_stock'
                )
              }
              className="bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low">Low Stock (≤ {lowStockThreshold})</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-stone-800">
              No products match your filters
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search keyword, category, or stock condition filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStockFilter('all');
              }}
              className="mt-3 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-stone-900 select-none"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name & SKU</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size & Color</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-stone-900 select-none"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-stone-900 select-none"
                    onClick={() => toggleSort('stock')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Stock Qty</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((product) => {
                  const isLow =
                    product.stockQuantity <= lowStockThreshold &&
                    product.stockQuantity > 0;
                  const isOut = product.stockQuantity === 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-stone-50/70 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {product.name}
                        </div>
                        {product.sku && (
                          <span className="font-mono text-[11px] text-stone-400">
                            SKU: {product.sku}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            product.category === 'Kids'
                              ? 'bg-orange-100 text-orange-800'
                              : product.category === 'Men'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {product.category}
                        </span>
                      </td>

                      {/* Size & Color */}
                      <td className="py-3 px-4 text-stone-600">
                        <div className="flex items-center gap-2">
                          <span className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded font-mono text-xs font-semibold text-stone-800">
                            {product.size}
                          </span>
                          <span className="text-xs text-stone-500">
                            {product.color}
                          </span>
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                        ₹{product.price}
                      </td>

                      {/* Stock Quantity with inline controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Decrease Stock"
                            disabled={product.stockQuantity <= 0}
                            onClick={() =>
                              onUpdateStock(
                                product.id,
                                Math.max(0, product.stockQuantity - 1)
                              )
                            }
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>

                          <span
                            className={`min-w-[40px] px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                              isOut
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {product.stockQuantity}
                          </span>

                          <button
                            type="button"
                            title="Increase Stock (+1)"
                            onClick={() =>
                              onUpdateStock(product.id, product.stockQuantity + 1)
                            }
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5 flex items-center justify-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Low stock</span>
                          </div>
                        )}
                        {isOut && (
                          <div className="text-[10px] text-red-700 font-medium mt-0.5">
                            Out of stock
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Add to Bill */}
                          {onAddProductToBill && (
                            <button
                              id={`bill-add-${product.id}`}
                              type="button"
                              disabled={isOut}
                              onClick={() => onAddProductToBill(product)}
                              title="Add to New Bill"
                              className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            id={`edit-prod-${product.id}`}
                            type="button"
                            onClick={() => onOpenEditModal(product)}
                            title="Edit Product"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete with inline confirmation */}
                          {deleteConfirmId === product.id ? (
                            <div className="inline-flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProduct(product.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1 text-[11px] text-stone-600 hover:text-stone-900"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`del-prod-${product.id}`}
                              type="button"
                              onClick={() => setDeleteConfirmId(product.id)}
                              title="Delete Product"
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of{' '}
            <strong>{products.length}</strong> products
          </span>
          <div className="flex items-center gap-4">
            <span className="text-amber-800 font-medium">
              Low Stock: <strong>{lowStockCount}</strong>
            </span>
            <span className="text-red-700 font-medium">
              Out of Stock: <strong>{outOfStockCount}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
