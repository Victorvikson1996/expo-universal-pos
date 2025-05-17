import type { ApiResponse } from '@/utils/types';

// Mock API service for demo purposes
// In a real app, this would use fetch or axios to make actual API calls
class ApiService {
  private baseUrl = 'https://api.yourpaymentbackend.com';
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Mock implementation of GET request
  async get(endpoint: string): Promise<ApiResponse> {
    console.log(`GET ${this.baseUrl}${endpoint}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock responses based on endpoint
    if (endpoint.includes('/transactions')) {
      return this.mockTransactionHistory();
    }

    return { success: false, error: 'Endpoint not implemented in mock API' };
  }

  // Mock implementation of POST request
  async post(endpoint: string, data: any): Promise<ApiResponse> {
    console.log(`POST ${this.baseUrl}${endpoint}`, data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock responses based on endpoint
    if (endpoint === '/auth/login') {
      return this.mockLogin(data);
    }

    if (endpoint === '/payments/process') {
      return this.mockPaymentProcess(data);
    }

    return { success: false, error: 'Endpoint not implemented in mock API' };
  }

  // Mock login response
  private mockLogin(data: { username: string; password: string }): ApiResponse {
    // For demo purposes, accept any username/password
    if (data.username && data.password) {
      return {
        success: true,
        data: {
          user: {
            id: 'usr_123456',
            username: data.username,
            name: 'Demo Merchant',
            role: 'admin',
            merchantId: 'merch_123456',
            terminalId: 'term_123456'
          },
          token: 'mock_jwt_token_' + Math.random().toString(36).substring(2)
        }
      };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  // Mock payment processing response
  private mockPaymentProcess(data: any): ApiResponse {
    // Generate a random transaction ID
    const transactionId =
      'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Generate a random auth code
    const authCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 95% chance of success
    const isSuccessful = Math.random() > 0.05;

    if (isSuccessful) {
      return {
        success: true,
        data: {
          transaction: {
            id: transactionId,
            merchantId: data.merchantId,
            terminalId: data.terminalId,
            amount: data.amount - data.amount * 0.08, // Subtract tax to get base amount
            tax: data.amount * 0.08,
            total: data.amount,
            items: data.items,
            paymentMethod: data.paymentMethod,
            cardData: data.cardData || {
              cardType: 'Visa',
              lastFour: '4242',
              expiryDate: '12/25'
            },
            status: 'approved',
            authCode,
            referenceNumber: transactionId,
            timestamp: new Date().toISOString()
          }
        }
      };
    } else {
      return {
        success: false,
        error: 'Payment declined. Please try another payment method.'
      };
    }
  }

  // Mock transaction history
  private mockTransactionHistory(): ApiResponse {
    const transactions = [];

    // Generate 10 random transactions
    for (let i = 0; i < 10; i++) {
      const amount = Math.floor(Math.random() * 10000) / 100;
      const tax = amount * 0.08;
      const total = amount + tax;

      const paymentMethods = ['CARD', 'NFC', 'CARD', 'NFC', 'CARD'];
      const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];

      const transaction = {
        id: 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        merchantId: 'merch_123456',
        terminalId: 'term_123456',
        amount,
        tax,
        total,
        items: [
          {
            product: {
              id: 'prod_' + i,
              name: 'Product ' + (i + 1),
              price: amount,
              image: 'https://picsum.photos/id/' + (200 + i) + '/200',
              category: 'Category',
              sku: 'SKU' + i
            },
            quantity: 1,
            price: amount
          }
        ],
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        cardData: {
          cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
          lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
          expiryDate: `${Math.floor(1 + Math.random() * 12)}/${Math.floor(
            23 + Math.random() * 7
          )}`
        },
        status: 'approved',
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referenceNumber:
          'REF' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString()
      };

      transactions.push(transaction);
    }

    return {
      success: true,
      data: {
        transactions
      }
    };
  }
}

export const api = new ApiService();
