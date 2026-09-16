import { Bill } from '../types';

/**
 * Formats a number to Indian Rupee currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Cleans and standardizes the phone number for WhatsApp wa.me links
 * e.g., "9876543210" -> "919876543210"
 * e.g., "+91 98765-43210" -> "919876543210"
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // If 10 digits (standard Indian mobile number without country code), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Reusable function to generate the text content for the customer WhatsApp message.
 * Formatted with line breaks so it is readable and structured.
 */
export function generateWhatsAppMessageText(
  bill: Bill,
  shopName: string = 'Prem Collection'
): string {
  const billDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const billTime = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];

  lines.push(`🛍️ *${shopName.toUpperCase()}*`);
  lines.push(`Invoice: #${bill.id}`);
  lines.push(`Date: ${billDate} at ${billTime}`);
  if (bill.customerName) {
    lines.push(`Customer: ${bill.customerName}`);
  }
  lines.push('--------------------------------');
  lines.push('ITEMS PURCHASED:');

  bill.items.forEach((item, index) => {
    const itemDetails = `• ${item.name} (${item.category} | ${item.size} | ${item.color})`;
    const calc = `  ${item.quantity} x ₹${item.unitPrice} = ₹${item.lineTotal}`;
    lines.push(`${itemDetails}\n${calc}`);
  });

  lines.push('--------------------------------');
  lines.push(`Subtotal: ₹${bill.subtotal}`);

  if (bill.discountAmount > 0) {
    const discountLabel =
      bill.discountType === 'percentage'
        ? `Discount (${bill.discountValue}%):`
        : `Discount:`;
    lines.push(`${discountLabel} -₹${bill.discountAmount}`);
  }

  lines.push(`*Grand Total: ₹${bill.total}*`);
  lines.push('--------------------------------');
  lines.push('Thank you for shopping at Prem Collection!');
  lines.push('Visit us again soon. ✨');

  return lines.join('\n');
}

/**
 * Generates the click-to-chat WhatsApp link using %0A for newlines
 * https://wa.me/<customer_phone>?text=<encoded_message>
 */
export function generateWhatsAppLink(
  bill: Bill,
  shopName: string = 'Prem Collection'
): string {
  const rawText = generateWhatsAppMessageText(bill, shopName);
  const normalizedPhone = cleanPhoneNumber(bill.customerPhone);

  // Use encodeURIComponent which transforms \n into %0A
  const encodedText = encodeURIComponent(rawText);

  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
