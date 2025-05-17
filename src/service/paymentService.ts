import { mockApiCall } from '@/utils/mockApi';
import { authService } from '@/service/authService';
import type { ApiResponse, PaymentRequest } from '@/utils/types';

class PaymentService {
  async processPayment(paymentRequest: PaymentRequest): Promise<ApiResponse> {
    const token = authService.getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // In a real app, this would be an API call to your payment processing backend
    return mockApiCall({
      endpoint: '/payments/process',
      method: 'POST',
      data: paymentRequest,
      headers: { Authorization: `Bearer ${token}` },
      mockResponse: (data) => {
        // Generate a random transaction ID
        const transactionId =
          'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();

        // Generate a random auth code
        const authCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

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
    });
  }

  async getTransactions(
    merchantId: string,
    terminalId: string
  ): Promise<ApiResponse> {
    const token = authService.getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // In a real app, this would be an API call to your backend
    return mockApiCall({
      endpoint: `/transactions?merchantId=${merchantId}&terminalId=${terminalId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      mockResponse: () => {
        const transactions = [];

        // Generate 10 random transactions
        for (let i = 0; i < 10; i++) {
          const amount = Math.floor(Math.random() * 10000) / 100;
          const tax = amount * 0.08;
          const total = amount + tax;

          const paymentMethods = ['CARD', 'NFC', 'CARD', 'NFC', 'CARD'];
          const cardTypes = [
            'Visa',
            'Mastercard',
            'American Express',
            'Discover'
          ];

          const transaction = {
            id:
              'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            merchantId,
            terminalId,
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
    });
  }
}

export const paymentService = new PaymentService();
