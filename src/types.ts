export type ProductCategory = 'Kids' | 'Men' | 'Women';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  size: string;
  color: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  createdAt?: string;
}

export interface BillItem {
  productId: string;
  name: string;
  category: ProductCategory;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export type DiscountType = 'flat' | 'percentage';

export interface Bill {
  id: string; // e.g. PC-1001
  createdAt: string; // ISO string
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  status: 'completed' | 'cancelled';
  cancelledAt?: string;
}

export type ActiveTab = 'dashboard' | 'billing' | 'inventory' | 'history';
