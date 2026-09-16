import React, { useState, useEffect } from 'react';
import { X, Check, PackagePlus, Edit } from 'lucide-react';
import { Product, ProductCategory } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
  editingProduct?: Product | null;
}

const COMMON_SIZES: Record<ProductCategory, string[]> = {
  Kids: ['2-3 Y', '3-4 Y', '4-5 Y', '5-6 Y', '6-7 Y', '7-8 Y', '26', '28', '30'],
  Men: ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'Free Size'],
  Women: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', 'Free Size'],
};

const COMMON_COLORS = [
  'Navy Blue',
  'Black',
  'White',
  'Off-White',
  'Maroon',
  'Olive Green',
  'Sky Blue',
  'Mustard Gold',
  'Pastel Peach',
  'Dusty Rose',
  'Charcoal',
  'Indigo',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Men');
  const [size, setSize] = useState('L');
  const [color, setColor] = useState('Navy Blue');
  const [price, setPrice] = useState<number | ''>(999);
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [sku, setSku] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setSize(editingProduct.size);
      setColor(editingProduct.color);
      setPrice(editingProduct.price);
      setStockQuantity(editingProduct.stockQuantity);
      setSku(editingProduct.sku || '');
    } else {
      setName('');
      setCategory('Men');
      setSize('L');
      setColor('Navy Blue');
      setPrice('');
      setStockQuantity(10);
      setSku('');
    }
    setErrors({});
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!size.trim()) errs.size = 'Size is required';
    if (!color.trim()) errs.color = 'Color is required';
    if (price === '' || Number(price) <= 0) errs.price = 'Valid price in ₹ is required';
    if (stockQuantity === '' || Number(stockQuantity) < 0)
      errs.stockQuantity = 'Stock quantity cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        name: name.trim(),
        category,
        size: size.trim(),
        color: color.trim(),
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        sku: sku.trim() || undefined,
      },
      editingProduct ? editingProduct.id : undefined
    );
    onClose();
  };

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="product-modal-container"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {editingProduct ? (
                <Edit className="w-4 h-4" />
              ) : (
                <PackagePlus className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-semibold text-base">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
          </div>
          <button
            id="close-product-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Kids', 'Men', 'Women'] as ProductCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`cat-select-${cat}`}
                  onClick={() => {
                    setCategory(cat);
                    // Reset size default for this category
                    if (COMMON_SIZES[cat] && !COMMON_SIZES[cat].includes(size)) {
                      setSize(COMMON_SIZES[cat][0]);
                    }
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                    category === cat
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {cat === 'Kids' ? "Kids Wear" : cat === 'Men' ? "Men's Wear" : "Women's Wear"}
                </button>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label
              htmlFor="product-name-input"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1"
            >
              Product Name *
            </label>
            <input
              id="product-name-input"
              type="text"
              placeholder="e.g. Pure Cotton Slim Fit Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors ${
                errors.name ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Size with quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="product-size-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
              >
                Size *
              </label>
              <span className="text-[11px] text-stone-400">Pick or type custom</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_SIZES[category].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    size === s
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              id="product-size-input"
              type="text"
              placeholder="Size (e.g. M, 32, 4-5 Y, Free Size)"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                errors.size ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
              }`}
            />
            {errors.size && (
              <p className="text-red-600 text-xs mt-1">{errors.size}</p>
            )}
          </div>

          {/* Color with quick suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="product-color-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
              >
                Color *
              </label>
              <span className="text-[11px] text-stone-400">Pick or type custom</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    color === c
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              id="product-color-input"
              type="text"
              placeholder="Color (e.g. Navy Blue, Dusty Rose)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                errors.color ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
              }`}
            />
            {errors.color && (
              <p className="text-red-600 text-xs mt-1">{errors.color}</p>
            )}
          </div>

          {/* Price & Stock in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="product-price-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1"
              >
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-stone-400 font-medium">
                  ₹
                </span>
                <input
                  id="product-price-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="999"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono font-medium ${
                    errors.price ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-red-600 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-stock-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1"
              >
                Initial Stock *
              </label>
              <input
                id="product-stock-input"
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono font-medium ${
                  errors.stockQuantity ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
                }`}
              />
              {errors.stockQuantity && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.stockQuantity}
                </p>
              )}
            </div>
          </div>

          {/* SKU / Barcode / Code (Optional) */}
          <div>
            <label
              htmlFor="product-sku-input"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1"
            >
              SKU / Tag Code (Optional)
            </label>
            <input
              id="product-sku-input"
              type="text"
              placeholder="e.g. PC-MN-101"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-product-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-product-btn"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
