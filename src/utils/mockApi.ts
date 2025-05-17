interface MockApiOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  mockResponse: (data: any) => any;
  delay?: number;
}

export const mockApiCall = async ({
  endpoint,
  method,
  data,
  headers,
  mockResponse,
  delay = 500
}: MockApiOptions) => {
  console.log(`${method} ${endpoint}`, data || '');

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate mock response
  return mockResponse(data || {});
};
