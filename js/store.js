/**
 * AutoShop & QA Lab - LocalStorage State Manager
 * Handles all data persistence in the browser without requiring a backend database.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'qa_shop_products',
  USERS: 'qa_shop_users',
  CURRENT_USER: 'qa_shop_current_user',
  CART: 'qa_shop_cart',
  WISHLIST: 'qa_shop_wishlist',
  ORDERS: 'qa_shop_orders',
  KANBAN: 'qa_shop_kanban',
  THEME: 'qa_shop_theme',
  APP_VERSION: 'qa_shop_version'
};

const CURRENT_APP_VERSION = '1.0.0';

const INITIAL_PRODUCTS = [
  {
    id: 'PRD-1001',
    sku: 'MECH-KB-01',
    name: 'KeyChronos Pro Mechanical Keyboard',
    category: 'Peripherals',
    price: 129.99,
    rating: 4.8,
    stock: 24,
    inStock: true,
    onSale: true,
    color: '#3b82f6',
    releaseDate: '2026-01-15',
    badge: 'Best Seller',
    image: '⌨️',
    description: 'Hot-swappable RGB wireless mechanical keyboard with tactile switches for coding and automation.'
  },
  {
    id: 'PRD-1002',
    sku: 'MOUSE-UL-02',
    name: 'HyperGlide UltraLight Wireless Mouse',
    category: 'Peripherals',
    price: 79.50,
    rating: 4.6,
    stock: 15,
    inStock: true,
    onSale: false,
    color: '#10b981',
    releaseDate: '2026-02-10',
    badge: 'New',
    image: '🖱️',
    description: '58g ultra-lightweight optical sensor mouse with 26,000 DPI and zero-latency dongle.'
  },
  {
    id: 'PRD-1003',
    sku: 'MON-4K-03',
    name: 'UltraView 32" 4K IPS Developer Monitor',
    category: 'Monitors',
    price: 449.00,
    rating: 4.9,
    stock: 8,
    inStock: true,
    onSale: true,
    color: '#6366f1',
    releaseDate: '2025-11-20',
    badge: 'Sale',
    image: '🖥️',
    description: '32-inch 4K UHD monitor with USB-C 90W power delivery and built-in KVM switch.'
  },
  {
    id: 'PRD-1004',
    sku: 'AUDIO-NC-04',
    name: 'SonicShield ANC Studio Headphones',
    category: 'Audio',
    price: 199.99,
    rating: 4.5,
    stock: 0,
    inStock: false,
    onSale: false,
    color: '#f59e0b',
    releaseDate: '2025-09-05',
    badge: 'Out of Stock',
    image: '🎧',
    description: 'Active noise cancelling over-ear headphones with 40-hour battery life and dual-device pairing.'
  },
  {
    id: 'PRD-1005',
    sku: 'DOCK-TB4-05',
    name: 'ThunderHub 12-in-1 USB-C Docking Station',
    category: 'Accessories',
    price: 159.00,
    rating: 4.3,
    stock: 32,
    inStock: true,
    onSale: false,
    color: '#64748b',
    releaseDate: '2026-03-01',
    badge: '',
    image: '🔌',
    description: 'Dual 4K HDMI, Gigabit Ethernet, SD card reader, and 100W pass-through charging.'
  },
  {
    id: 'PRD-1006',
    sku: 'CAM-4K-06',
    name: 'StreamLens 4K AI Auto-Focus Webcam',
    category: 'Peripherals',
    price: 94.99,
    rating: 4.1,
    stock: 19,
    inStock: true,
    onSale: true,
    color: '#ec4899',
    releaseDate: '2026-04-12',
    badge: 'Sale',
    image: '📷',
    description: 'HDR 60fps webcam with built-in privacy shutter and dual noise-reducing microphones.'
  },
  {
    id: 'PRD-1007',
    sku: 'CHAIR-ERG-07',
    name: 'AeroMesh Ergonomic Task Chair',
    category: 'Furniture',
    price: 329.00,
    rating: 4.7,
    stock: 5,
    inStock: true,
    onSale: false,
    color: '#0ea5e9',
    releaseDate: '2025-12-01',
    badge: 'Low Stock',
    image: '🪑',
    description: 'Breathable mesh backrest with 4D armrests and dynamic lumbar support.'
  },
  {
    id: 'PRD-1008',
    sku: 'MIC-USB-08',
    name: 'VoiceCast Cardioid Condenser USB Mic',
    category: 'Audio',
    price: 114.00,
    rating: 4.4,
    stock: 12,
    inStock: true,
    onSale: false,
    color: '#8b5cf6',
    releaseDate: '2026-01-28',
    badge: '',
    image: '🎙️',
    description: 'Plug-and-play broadcast microphone with tap-to-mute sensor and gain control dial.'
  }
];

const INITIAL_USERS = [
  {
    id: 'USR-01',
    username: 'standard_user',
    email: 'user@qalab.dev',
    password: 'SecretPassword123!',
    role: 'customer',
    fullName: 'Alex Tester',
    status: 'active'
  },
  {
    id: 'USR-02',
    username: 'admin_user',
    email: 'admin@qalab.dev',
    password: 'SecretPassword123!',
    role: 'admin',
    fullName: 'Morgan Admin',
    status: 'active'
  },
  {
    id: 'USR-03',
    username: 'locked_out_user',
    email: 'locked@qalab.dev',
    password: 'SecretPassword123!',
    role: 'customer',
    fullName: 'Locked Account',
    status: 'locked'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-9001',
    createdAt: '2026-10-15T14:32:00Z',
    customerName: 'Alex Tester',
    customerEmail: 'user@qalab.dev',
    items: [
      { id: 'PRD-1001', name: 'KeyChronos Pro Mechanical Keyboard', price: 129.99, quantity: 1 },
      { id: 'PRD-1002', name: 'HyperGlide UltraLight Wireless Mouse', price: 79.50, quantity: 1 }
    ],
    subtotal: 209.49,
    discount: 20.95,
    shipping: 0,
    tax: 15.08,
    total: 203.62,
    couponCode: 'SAVE10',
    shippingMethod: 'express',
    paymentMethod: 'credit_card',
    status: 'Delivered',
    address: {
      street: '742 Automation Way',
      city: 'Austin',
      country: 'US',
      zip: '78701'
    }
  }
];

const INITIAL_KANBAN = {
  todo: [
    { id: 'TASK-101', title: 'Write login E2E negative test cases', priority: 'High' },
    { id: 'TASK-102', title: 'Automate checkout with coupon SAVE10', priority: 'Medium' },
    { id: 'TASK-103', title: 'Verify Shadow DOM input locator', priority: 'Low' }
  ],
  inprogress: [
    { id: 'TASK-104', title: 'Configure GitHub Actions CI pipeline', priority: 'High' }
  ],
  done: [
    { id: 'TASK-105', title: 'Setup local storage state seeding', priority: 'Medium' }
  ]
};

export const VALID_COUPONS = {
  SAVE10: { code: 'SAVE10', type: 'percent', value: 10, description: '10% off subtotal' },
  QA2026: { code: 'QA2026', type: 'percent', value: 20, description: '20% off QA special' },
  FLAT25: { code: 'FLAT25', type: 'fixed', value: 25, description: '$25 flat discount on orders' }
};

export const Store = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KANBAN)) {
      localStorage.setItem(STORAGE_KEYS.KANBAN, JSON.stringify(INITIAL_KANBAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_APP_VERSION);
  },

  resetAll() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.KANBAN, JSON.stringify(INITIAL_KANBAN));
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_APP_VERSION);
  },

  exportState() {
    return {
      version: CURRENT_APP_VERSION,
      timestamp: new Date().toISOString(),
      products: this.getProducts(),
      users: this.getUsers(),
      currentUser: this.getCurrentUser(),
      cart: this.getCart(),
      wishlist: this.getWishlist(),
      orders: this.getOrders(),
      kanban: this.getKanban()
    };
  },

  importState(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid state JSON object');
    }
    if (Array.isArray(data.products)) this.saveProducts(data.products);
    if (Array.isArray(data.users)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    if (Array.isArray(data.cart)) this.saveCart(data.cart);
    if (Array.isArray(data.wishlist)) localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(data.wishlist));
    if (Array.isArray(data.orders)) this.saveOrders(data.orders);
    if (data.kanban) this.saveKanban(data.kanban);
  },

  getProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || [];
    } catch {
      return [];
    }
  },

  toggleWishlist(productId) {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(productId);
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    return list;
  },

  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
    } catch {
      return [];
    }
  },

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getKanban() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.KANBAN)) || INITIAL_KANBAN;
    } catch {
      return INITIAL_KANBAN;
    }
  },

  saveKanban(kanban) {
    localStorage.setItem(STORAGE_KEYS.KANBAN, JSON.stringify(kanban));
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
};
