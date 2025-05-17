import type { Product } from '@/utils/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Coffee',
    price: 3.99,
    image: 'https://picsum.photos/id/431/200',
    category: 'Beverages',
    sku: 'BEV001',
    barcode: '123456789012'
  },
  {
    id: '2',
    name: 'Sandwich',
    price: 6.99,
    image: 'https://picsum.photos/id/292/200',
    category: 'Food',
    sku: 'FOOD001',
    barcode: '223456789012'
  },
  {
    id: '3',
    name: 'Salad',
    price: 5.99,
    image: 'https://picsum.photos/id/1080/200',
    category: 'Food',
    sku: 'FOOD002',
    barcode: '323456789012'
  },
  {
    id: '4',
    name: 'Muffin',
    price: 2.99,
    image: 'https://picsum.photos/id/835/200',
    category: 'Bakery',
    sku: 'BAK001',
    barcode: '423456789012'
  },
  {
    id: '5',
    name: 'Tea',
    price: 2.49,
    image: 'https://picsum.photos/id/225/200',
    category: 'Beverages',
    sku: 'BEV002',
    barcode: '523456789012'
  },
  {
    id: '6',
    name: 'Croissant',
    price: 3.49,
    image: 'https://picsum.photos/id/267/200',
    category: 'Bakery',
    sku: 'BAK002',
    barcode: '623456789012'
  },
  {
    id: '7',
    name: 'Smoothie',
    price: 4.99,
    image: 'https://picsum.photos/id/1080/200',
    category: 'Beverages',
    sku: 'BEV003',
    barcode: '723456789012'
  },
  {
    id: '8',
    name: 'Burger',
    price: 8.99,
    image: 'https://picsum.photos/id/1060/200',
    category: 'Food',
    sku: 'FOOD003',
    barcode: '823456789012'
  }
];

export const categories = [
  ...new Set(products.map((product) => product.category))
];
