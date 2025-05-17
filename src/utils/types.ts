// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sku: string;
  barcode?: string;
}

// Card data types
export interface CardData {
  cardType: string;
  lastFour: string;
  expiryDate: string;
  cardholderName?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  merchantId: string;
  terminalId: string;
  amount: number;
  tax: number;
  total: number;
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  paymentMethod: string;
  cardData?: CardData;
  status: 'approved' | 'declined' | 'voided' | 'refunded';
  authCode?: string;
  referenceNumber: string;
  timestamp: string;
}

export interface PaymentResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

// API response type
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Payment request type
export interface PaymentRequest {
  merchantId: string;
  terminalId: string;
  amount: number;
  items: any[];
  paymentMethod: string;
  cardPresent: boolean;
  cardData?: CardData;
}
