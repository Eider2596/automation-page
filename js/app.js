import { Store, VALID_COUPONS } from './store.js';

/**
 * Custom Web Component with Open Shadow DOM for QA Automation Practice
 */
class QaShadowWidget extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        .shadow-box {
          padding: 12px;
          border: 1px dashed #3b82f6;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.06);
          font-family: inherit;
        }
        label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        input[type="text"] {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        button {
          padding: 6px 12px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .shadow-status {
          font-size: 0.8rem;
          margin-top: 6px;
          font-weight: 600;
        }
      </style>
      <div class="shadow-box" id="shadow-inner-container" data-testid="shadow-inner-container">
        <label for="shadow-input">Shadow Secret Key (Inside #shadow-root):</label>
        <div class="row">
          <input type="text" id="shadow-input" data-testid="shadow-input" placeholder="Enter e.g. SHADOW-OK" />
          <button type="button" id="shadow-verify-btn" data-testid="shadow-verify-btn">Verify</button>
        </div>
        <label style="font-weight: 500; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" id="shadow-checkbox" data-testid="shadow-checkbox" />
          <span>Enable Shadow Telemetry</span>
        </label>
        <div class="shadow-status" id="shadow-status" data-testid="shadow-status">
          Status: Waiting for Shadow DOM input...
        </div>
      </div>
    `;

    const input = root.getElementById('shadow-input');
    const checkbox = root.getElementById('shadow-checkbox');
    const btn = root.getElementById('shadow-verify-btn');
    const status = root.getElementById('shadow-status');

    btn.addEventListener('click', () => {
      const val = input.value.trim() || 'EMPTY';
      const tel = checkbox.checked ? 'ENABLED' : 'DISABLED';
      status.textContent = `Shadow Verified: "${val}" | Telemetry: ${tel}`;
      status.style.color = '#16a34a';
    });
  }
}

if (!customElements.get('qa-shadow-widget')) {
  customElements.define('qa-shadow-widget', QaShadowWidget);
}

// Application Runtime State
let activeCoupon = null;
let lastPlacedOrder = null;
let adminSortField = 'id';
let adminSortAsc = true;
let selectedAdminIds = new Set();
let progressInterval = null;
let progressValue = 25;
let staleGeneration = 1;
let infiniteScrollCount = 0;

// Initialize Store & UI
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  applyTheme(Store.getTheme());
  updateStorageIndicator();
  setupNavigation();
  setupUtilityBar();
  setupAuthModal();
  setupStorefrontFilters();
  setupCheckoutEvents();
  setupOrdersView();
  setupAdminPanel();
  setupSandboxChallenges();

  renderAll();
});

function renderAll() {
  renderAuthHeader();
  renderStorefront();
  renderCartAndCheckout();
  renderOrdersTable();
  renderAdminTable();
  renderKanbanBoard();
  updateStorageIndicator();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('data-testid', 'toast-notification');
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;font-weight:700;">✕</button>
  `;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3500);
}

function updateStorageIndicator() {
  const counter = document.getElementById('storage-counter');
  const products = Store.getProducts().length;
  const orders = Store.getOrders().length;
  counter.textContent = `${products} Products | ${orders} Orders in LocalStorage`;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  Store.setTheme(theme);
}

// ==================== NAVIGATION & TOP BAR ====================
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
      mainNav.classList.remove('mobile-open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  mobileBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('mobile-open');
    mobileBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.getElementById('brand-home-link').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('store');
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.toggle('active', sec.id === `view-${tabName}`);
  });
}

function setupUtilityBar() {
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const next = Store.getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Theme switched to ${next} mode`);
  });

  document.getElementById('btn-export-state').addEventListener('click', () => {
    const data = Store.exportState();
    downloadFile('autoshop-localstorage-state.json', JSON.stringify(data, null, 2), 'application/json');
    showToast('LocalStorage state exported as JSON', 'success');
  });

  document.getElementById('btn-reset-storage').addEventListener('click', () => {
    Store.resetAll();
    activeCoupon = null;
    selectedAdminIds.clear();
    renderAll();
    showToast('LocalStorage reset to default seed state!', 'success');
  });
}

// ==================== AUTHENTICATION ====================
function setupAuthModal() {
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('btn-open-auth');
  const closeBtn = document.getElementById('btn-close-auth-modal');
  const logoutBtn = document.getElementById('btn-logout');
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error-msg');

  openBtn.addEventListener('click', () => {
    errorBox.style.display = 'none';
    modal.classList.add('open');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  document.querySelectorAll('[data-quick-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('login-username').value = btn.dataset.quickUser;
      document.getElementById('login-password').value = 'SecretPassword123!';
      errorBox.style.display = 'none';
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;

    const users = Store.getUsers();
    const user = users.find(
      (u) => (u.username === usernameInput || u.email === usernameInput) && u.password === passwordInput
    );

    if (!user) {
      errorBox.textContent = 'Invalid username or password. Please try again.';
      errorBox.style.display = 'block';
      return;
    }

    if (user.status === 'locked') {
      errorBox.textContent = 'Account Locked: This user has been locked out. Contact QA administrator.';
      errorBox.style.display = 'block';
      return;
    }

    Store.setCurrentUser({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
    modal.classList.remove('open');
    form.reset();
    renderAuthHeader();
    showToast(`Signed in as ${user.username} (${user.role})`, 'success');
  });

  logoutBtn.addEventListener('click', () => {
    Store.setCurrentUser(null);
    renderAuthHeader();
    showToast('Signed out successfully');
  });
}

function renderAuthHeader() {
  const user = Store.getCurrentUser();
  const badge = document.getElementById('user-session-badge');
  const openBtn = document.getElementById('btn-open-auth');
  const logoutBtn = document.getElementById('btn-logout');

  if (user) {
    badge.textContent = `👤 ${user.username} (${user.role})`;
    openBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-flex';
  } else {
    badge.textContent = 'Guest Session';
    openBtn.style.display = 'inline-flex';
    logoutBtn.style.display = 'none';
  }
}

// ==================== STOREFRONT & FILTERS ====================
function setupStorefrontFilters() {
  const search = document.getElementById('filter-search');
  const category = document.getElementById('filter-category');
  const priceRange = document.getElementById('filter-price-range');
  const priceValue = document.getElementById('filter-price-value');
  const inStock = document.getElementById('filter-in-stock');
  const onSale = document.getElementById('filter-on-sale');
  const wishlistOnly = document.getElementById('filter-wishlist-only');
  const sortSelect = document.getElementById('sort-select');
  const clearBtn = document.getElementById('btn-clear-filters');

  const triggerFilter = () => {
    priceValue.textContent = priceRange.value;
    renderStorefront();
  };

  search.addEventListener('input', triggerFilter);
  category.addEventListener('change', triggerFilter);
  priceRange.addEventListener('input', triggerFilter);
  inStock.addEventListener('change', triggerFilter);
  onSale.addEventListener('change', triggerFilter);
  wishlistOnly.addEventListener('change', triggerFilter);
  sortSelect.addEventListener('change', triggerFilter);

  document.querySelectorAll('input[name="minRating"]').forEach((radio) => {
    radio.addEventListener('change', triggerFilter);
  });

  clearBtn.addEventListener('click', () => {
    search.value = '';
    category.value = 'ALL';
    priceRange.value = '500';
    priceValue.textContent = '500';
    document.querySelector('input[name="minRating"][value="0"]').checked = true;
    inStock.checked = false;
    onSale.checked = false;
    wishlistOnly.checked = false;
    sortSelect.value = 'featured';
    renderStorefront();
  });
}

function renderStorefront() {
  const products = Store.getProducts();
  const wishlist = Store.getWishlist();
  const query = document.getElementById('filter-search').value.trim().toLowerCase();
  const category = document.getElementById('filter-category').value;
  const maxPrice = parseFloat(document.getElementById('filter-price-range').value);
  const minRating = parseFloat(document.querySelector('input[name="minRating"]:checked')?.value || '0');
  const onlyInStock = document.getElementById('filter-in-stock').checked;
  const onlyOnSale = document.getElementById('filter-on-sale').checked;
  const onlyWishlist = document.getElementById('filter-wishlist-only').checked;
  const sortOrder = document.getElementById('sort-select').value;

  const filtered = products.filter((p) => {
    if (query && !`${p.name} ${p.sku} ${p.description}`.toLowerCase().includes(query)) return false;
    if (category !== 'ALL' && p.category !== category) return false;
    if (p.price > maxPrice) return false;
    if (p.rating < minRating) return false;
    if (onlyInStock && (!p.inStock || p.stock <= 0)) return false;
    if (onlyOnSale && !p.onSale) return false;
    if (onlyWishlist && !wishlist.includes(p.id)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    if (sortOrder === 'rating-desc') return b.rating - a.rating;
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  document.getElementById('results-count-text').textContent = `Showing ${filtered.length} of ${products.length} products`;

  const grid = document.getElementById('products-grid');
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="card-panel" style="grid-column: 1 / -1; text-align: center;" data-testid="empty-catalog-state">
        <h3>No matching products found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your search query or resetting the filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const isFav = wishlist.includes(p.id);
      const available = p.inStock && p.stock > 0;
      return `
        <article class="product-card" data-product-id="${p.id}" data-sku="${p.sku}" data-testid="product-card-${p.id}">
          <div>
            <div class="product-card-top">
              <span class="product-badge ${available ? '' : 'out'}">
                ${available ? p.badge || 'In Stock' : 'Out of Stock'}
              </span>
              <button
                type="button"
                class="wishlist-btn ${isFav ? 'active' : ''}"
                data-wishlist-id="${p.id}"
                data-testid="wishlist-btn-${p.id}"
                aria-label="Toggle wishlist for ${p.name}"
              >
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>
            <div class="product-icon" aria-hidden="true">${p.image || '📦'}</div>
            <div class="product-category">${p.category} • <code style="font-size:0.72rem;">${p.sku}</code></div>
            <h3 class="product-title" data-testid="product-title-${p.id}">${p.name}</h3>
            <p class="product-desc">${p.description}</p>
          </div>
          <div>
            <div class="product-meta">
              <span class="product-price" data-testid="product-price-${p.id}">$${p.price.toFixed(2)}</span>
              <span title="Customer Rating">⭐ ${p.rating.toFixed(1)} (${p.stock} left)</span>
            </div>
            <div class="product-actions">
              <button
                type="button"
                class="btn btn-primary"
                style="width: 100%;"
                data-add-cart="${p.id}"
                data-testid="add-to-cart-${p.id}"
                ${available ? '' : 'disabled'}
              >
                ${available ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll('[data-add-cart]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.addCart));
  });

  grid.querySelectorAll('[data-wishlist-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      Store.toggleWishlist(btn.dataset.wishlistId);
      renderStorefront();
    });
  });
}

// ==================== CART & CHECKOUT ====================
function addToCart(productId) {
  const products = Store.getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const cart = Store.getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  Store.saveCart(cart);
  renderCartAndCheckout();
  showToast(`Added "${product.name}" to cart`, 'success');
}

function setupCheckoutEvents() {
  document.getElementById('btn-clear-cart').addEventListener('click', () => {
    Store.saveCart([]);
    activeCoupon = null;
    document.getElementById('coupon-feedback').textContent = '';
    renderCartAndCheckout();
    showToast('Shopping cart emptied');
  });

  document.getElementById('btn-apply-coupon').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    const feedback = document.getElementById('coupon-feedback');
    if (VALID_COUPONS[code]) {
      activeCoupon = VALID_COUPONS[code];
      feedback.textContent = `✓ Applied ${activeCoupon.code} (${activeCoupon.description})`;
      feedback.style.color = 'var(--success)';
      renderCartAndCheckout();
    } else {
      activeCoupon = null;
      feedback.textContent = '✕ Invalid coupon code';
      feedback.style.color = 'var(--danger)';
      renderCartAndCheckout();
    }
  });

  document.getElementById('chk-shipping').addEventListener('change', renderCartAndCheckout);

  document.getElementById('chk-payment').addEventListener('change', (e) => {
    const ccFields = document.getElementById('credit-card-fields');
    ccFields.style.display = e.target.value === 'credit_card' ? 'grid' : 'none';
  });

  document.getElementById('btn-autofill-checkout').addEventListener('click', () => {
    const user = Store.getCurrentUser();
    document.getElementById('chk-fullname').value = user?.fullName || 'Alex Tester';
    document.getElementById('chk-email').value = user?.email || 'alex@qalab.dev';
    document.getElementById('chk-street').value = '742 Evergreen Terrace Suite 200';
    document.getElementById('chk-city').value = 'Austin';
    document.getElementById('chk-country').value = 'US';
    document.getElementById('chk-zip').value = '78701';
    document.getElementById('chk-shipping').value = 'express';
    document.getElementById('chk-payment').value = 'credit_card';
    document.getElementById('credit-card-fields').style.display = 'grid';
    document.getElementById('chk-card-num').value = '4532015112830366';
    document.getElementById('chk-card-cvv').value = '842';
    document.getElementById('chk-notes').value = 'Leave package at the QA Lab front desk.';
    document.getElementById('chk-terms').checked = true;
    renderCartAndCheckout();
  });

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePlaceOrder();
  });

  document.getElementById('btn-view-orders-after-checkout').addEventListener('click', () => {
    switchTab('orders');
  });

  document.getElementById('btn-download-last-receipt').addEventListener('click', () => {
    if (lastPlacedOrder) {
      downloadFile(`receipt-${lastPlacedOrder.id}.json`, JSON.stringify(lastPlacedOrder, null, 2), 'application/json');
    }
  });
}

function calculateCartTotals() {
  const cart = Store.getCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discount = 0;
  if (activeCoupon && subtotal > 0) {
    discount = activeCoupon.type === 'percent' ? subtotal * (activeCoupon.value / 100) : activeCoupon.value;
    discount = Math.min(discount, subtotal);
  }
  const shippingSelect = document.getElementById('chk-shipping')?.value || 'standard';
  let shipping = 0;
  if (subtotal > 0) {
    if (shippingSelect === 'express') shipping = 12;
    if (shippingSelect === 'overnight') shipping = 25;
  }
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.08;
  const total = taxable + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}

function renderCartAndCheckout() {
  const cart = Store.getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('nav-cart-count').textContent = String(totalQty);

  const tbody = document.getElementById('cart-tbody');
  if (cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted);" data-testid="empty-cart-message">
          Your shopping cart is empty. Add items from the Storefront!
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = cart
      .map(
        (item) => `
      <tr data-cart-row="${item.id}" data-testid="cart-row-${item.id}">
        <td><strong>${item.name}</strong></td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm" data-qty-dec="${item.id}" data-testid="cart-dec-${item.id}">-</button>
            <span data-testid="cart-qty-${item.id}">${item.quantity}</span>
            <button type="button" class="btn btn-secondary btn-sm" data-qty-inc="${item.id}" data-testid="cart-inc-${item.id}">+</button>
          </div>
        </td>
        <td data-testid="cart-item-subtotal-${item.id}">$${(item.price * item.quantity).toFixed(2)}</td>
        <td>
          <button type="button" class="btn btn-danger btn-sm" data-remove-cart="${item.id}" data-testid="cart-remove-${item.id}">
            Remove
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  tbody.querySelectorAll('[data-qty-dec]').forEach((btn) => {
    btn.addEventListener('click', () => updateCartQty(btn.dataset.qtyDec, -1));
  });
  tbody.querySelectorAll('[data-qty-inc]').forEach((btn) => {
    btn.addEventListener('click', () => updateCartQty(btn.dataset.qtyInc, 1));
  });
  tbody.querySelectorAll('[data-remove-cart]').forEach((btn) => {
    btn.addEventListener('click', () => removeCartItem(btn.dataset.removeCart));
  });

  const totals = calculateCartTotals();
  document.getElementById('summary-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById('summary-discount').textContent = `-$${totals.discount.toFixed(2)}`;
  document.getElementById('summary-shipping').textContent = `$${totals.shipping.toFixed(2)}`;
  document.getElementById('summary-tax').textContent = `$${totals.tax.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `$${totals.total.toFixed(2)}`;
}

function updateCartQty(id, delta) {
  const cart = Store.getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  Store.saveCart(cart);
  renderCartAndCheckout();
}

function removeCartItem(id) {
  const cart = Store.getCart().filter((i) => i.id !== id);
  Store.saveCart(cart);
  renderCartAndCheckout();
}

function handlePlaceOrder() {
  const errorBanner = document.getElementById('checkout-error-banner');
  errorBanner.style.display = 'none';

  const cart = Store.getCart();
  if (cart.length === 0) {
    errorBanner.textContent = 'Cannot place order: Your shopping cart is empty.';
    errorBanner.style.display = 'block';
    return;
  }

  const fullName = document.getElementById('chk-fullname').value.trim();
  const email = document.getElementById('chk-email').value.trim();
  const street = document.getElementById('chk-street').value.trim();
  const city = document.getElementById('chk-city').value.trim();
  const country = document.getElementById('chk-country').value;
  const zip = document.getElementById('chk-zip').value.trim();
  const shippingMethod = document.getElementById('chk-shipping').value;
  const paymentMethod = document.getElementById('chk-payment').value;
  const termsAccepted = document.getElementById('chk-terms').checked;

  if (!fullName || !email || !street || !city || !country || !zip) {
    errorBanner.textContent = 'Please complete all required shipping address fields (*).';
    errorBanner.style.display = 'block';
    return;
  }

  if (paymentMethod === 'credit_card') {
    const cardNum = document.getElementById('chk-card-num').value.replace(/\s+/g, '');
    const cvv = document.getElementById('chk-card-cvv').value.trim();
    if (cardNum.length < 12 || cvv.length < 3) {
      errorBanner.textContent = 'Please enter a valid 16-digit card number and 3-digit CVV.';
      errorBanner.style.display = 'block';
      return;
    }
  }

  if (!termsAccepted) {
    errorBanner.textContent = 'You must accept the QA Automation Terms & Conditions to continue.';
    errorBanner.style.display = 'block';
    return;
  }

  const totals = calculateCartTotals();
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    customerName: fullName,
    customerEmail: email,
    items: cart.map((i) => ({ ...i })),
    subtotal: Number(totals.subtotal.toFixed(2)),
    discount: Number(totals.discount.toFixed(2)),
    shipping: Number(totals.shipping.toFixed(2)),
    tax: Number(totals.tax.toFixed(2)),
    total: Number(totals.total.toFixed(2)),
    couponCode: activeCoupon ? activeCoupon.code : null,
    shippingMethod,
    paymentMethod,
    status: 'Processing',
    address: { street, city, country, zip }
  };

  // Decrement product stock in LocalStorage
  const products = Store.getProducts();
  cart.forEach((cartItem) => {
    const prod = products.find((p) => p.id === cartItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      prod.inStock = prod.stock > 0;
    }
  });
  Store.saveProducts(products);

  const orders = Store.getOrders();
  orders.unshift(newOrder);
  Store.saveOrders(orders);

  Store.saveCart([]);
  activeCoupon = null;
  lastPlacedOrder = newOrder;
  document.getElementById('checkout-form').reset();
  document.getElementById('coupon-input').value = '';
  document.getElementById('coupon-feedback').textContent = '';

  const confirmBox = document.getElementById('order-confirmation-box');
  const confirmMsg = document.getElementById('order-confirmation-message');
  confirmMsg.textContent = `Order ${newOrder.id} for ${newOrder.customerName} ($${newOrder.total.toFixed(2)}) has been saved to LocalStorage.`;
  confirmBox.style.display = 'block';

  renderAll();
  showToast(`Order ${newOrder.id} placed!`, 'success');
}

// ==================== ORDERS HISTORY ====================
function setupOrdersView() {
  document.getElementById('order-status-filter').addEventListener('change', renderOrdersTable);
}

function renderOrdersTable() {
  const orders = Store.getOrders();
  document.getElementById('nav-orders-count').textContent = String(orders.length);

  const filterStatus = document.getElementById('order-status-filter').value;
  const filtered = filterStatus === 'ALL' ? orders : orders.filter((o) => o.status === filterStatus);

  const tbody = document.getElementById('orders-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted);" data-testid="no-orders-row">
          No orders matching filter "${filterStatus}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((order) => {
      const tagClass =
        order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning';
      const itemSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
      return `
        <tr data-order-id="${order.id}" data-testid="order-row-${order.id}">
          <td><strong>${order.id}</strong></td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>${order.customerName}<br/><small style="color:var(--text-muted)">${order.customerEmail}</small></td>
          <td>${itemSummary}</td>
          <td data-testid="order-total-${order.id}"><strong>$${Number(order.total).toFixed(2)}</strong></td>
          <td>
            <span class="status-tag ${tagClass}" data-testid="order-status-${order.id}">${order.status}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <select
                class="form-control"
                style="width: auto; padding: 4px 8px; font-size: 0.78rem;"
                data-order-status-select="${order.id}"
                data-testid="change-order-status-${order.id}"
                aria-label="Update status for ${order.id}"
              >
                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
              <button type="button" class="btn btn-danger btn-sm" data-delete-order="${order.id}" data-testid="delete-order-${order.id}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-order-status-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const id = select.dataset.orderStatusSelect;
      const allOrders = Store.getOrders();
      const target = allOrders.find((o) => o.id === id);
      if (target) {
        target.status = select.value;
        Store.saveOrders(allOrders);
        renderOrdersTable();
        showToast(`Order ${id} status updated to ${select.value}`);
      }
    });
  });

  tbody.querySelectorAll('[data-delete-order]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteOrder;
      const remaining = Store.getOrders().filter((o) => o.id !== id);
      Store.saveOrders(remaining);
      renderAll();
      showToast(`Order ${id} deleted from LocalStorage`);
    });
  });
}

// ==================== ADMIN INVENTORY CRUD ====================
function setupAdminPanel() {
  const searchInput = document.getElementById('admin-search-input');
  const selectAll = document.getElementById('admin-select-all');
  const bulkDeleteBtn = document.getElementById('btn-admin-bulk-delete');
  const addProductBtn = document.getElementById('btn-admin-add-product');
  const modal = document.getElementById('product-modal');
  const closeModal = document.getElementById('btn-close-product-modal');
  const cancelModal = document.getElementById('btn-cancel-product');
  const form = document.getElementById('product-form');

  searchInput.addEventListener('input', renderAdminTable);

  document.querySelectorAll('#admin-products-table th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (adminSortField === field) {
        adminSortAsc = !adminSortAsc;
      } else {
        adminSortField = field;
        adminSortAsc = true;
      }
      renderAdminTable();
    });
  });

  selectAll.addEventListener('change', () => {
    const products = Store.getProducts();
    if (selectAll.checked) {
      products.forEach((p) => selectedAdminIds.add(p.id));
    } else {
      selectedAdminIds.clear();
    }
    renderAdminTable();
  });

  bulkDeleteBtn.addEventListener('click', () => {
    if (selectedAdminIds.size === 0) return;
    const count = selectedAdminIds.size;
    const remaining = Store.getProducts().filter((p) => !selectedAdminIds.has(p.id));
    Store.saveProducts(remaining);
    selectedAdminIds.clear();
    selectAll.checked = false;
    renderAll();
    showToast(`Deleted ${count} product(s) from inventory`, 'success');
  });

  addProductBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('prd-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    modal.classList.add('open');
  });

  closeModal.addEventListener('click', () => modal.classList.remove('open'));
  cancelModal.addEventListener('click', () => modal.classList.remove('open'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('prd-id').value;
    const name = document.getElementById('prd-name').value.trim();
    const sku = document.getElementById('prd-sku').value.trim().toUpperCase();
    const category = document.getElementById('prd-category').value;
    const price = parseFloat(document.getElementById('prd-price').value) || 0;
    const stock = parseInt(document.getElementById('prd-stock').value, 10) || 0;
    const rating = parseFloat(document.getElementById('prd-rating').value) || 4.5;
    const description = document.getElementById('prd-desc').value.trim();
    const onSale = document.getElementById('prd-on-sale').checked;

    const products = Store.getProducts();
    if (id) {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        Object.assign(existing, {
          name,
          sku,
          category,
          price,
          stock,
          inStock: stock > 0,
          rating,
          description,
          onSale,
          badge: stock === 0 ? 'Out of Stock' : onSale ? 'Sale' : ''
        });
      }
      showToast(`Updated product ${name}`, 'success');
    } else {
      const newProd = {
        id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        sku,
        name,
        category,
        price,
        stock,
        inStock: stock > 0,
        rating,
        description: description || 'Custom QA automated test product.',
        onSale,
        badge: stock === 0 ? 'Out of Stock' : onSale ? 'Sale' : 'New',
        image: '📦'
      };
      products.unshift(newProd);
      showToast(`Created product ${newProd.id}`, 'success');
    }

    Store.saveProducts(products);
    modal.classList.remove('open');
    renderAll();
  });
}

function renderAdminTable() {
  const query = document.getElementById('admin-search-input').value.trim().toLowerCase();
  const products = Store.getProducts().filter((p) =>
    !query ? true : `${p.id} ${p.sku} ${p.name} ${p.category}`.toLowerCase().includes(query)
  );

  products.sort((a, b) => {
    const valA = a[adminSortField];
    const valB = b[adminSortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return adminSortAsc ? valA - valB : valB - valA;
    }
    return adminSortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  document.getElementById('admin-selected-count').textContent = String(selectedAdminIds.size);
  document.getElementById('btn-admin-bulk-delete').disabled = selectedAdminIds.size === 0;

  const tbody = document.getElementById('admin-products-tbody');
  tbody.innerHTML = products
    .map((p) => {
      const isSelected = selectedAdminIds.has(p.id);
      const inStock = p.stock > 0;
      return `
        <tr data-admin-row="${p.id}" data-testid="admin-row-${p.id}">
          <td>
            <input
              type="checkbox"
              data-admin-check="${p.id}"
              data-testid="admin-check-${p.id}"
              aria-label="Select ${p.name}"
              ${isSelected ? 'checked' : ''}
            />
          </td>
          <td><code>${p.id}</code></td>
          <td><code>${p.sku}</code></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.category}</td>
          <td>$${p.price.toFixed(2)}</td>
          <td>${p.stock}</td>
          <td>
            <span class="status-tag ${inStock ? 'success' : 'danger'}">
              ${inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-admin-edit="${p.id}" data-testid="admin-edit-${p.id}">
                Edit
              </button>
              <button type="button" class="btn btn-danger btn-sm" data-admin-del="${p.id}" data-testid="admin-delete-${p.id}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-admin-check]').forEach((chk) => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.adminCheck;
      if (chk.checked) selectedAdminIds.add(id);
      else selectedAdminIds.delete(id);
      renderAdminTable();
    });
  });

  tbody.querySelectorAll('[data-admin-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditProductModal(btn.dataset.adminEdit));
  });

  tbody.querySelectorAll('[data-admin-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.adminDel;
      const remaining = Store.getProducts().filter((p) => p.id !== id);
      Store.saveProducts(remaining);
      selectedAdminIds.delete(id);
      renderAll();
      showToast(`Deleted product ${id}`);
    });
  });
}

function openEditProductModal(productId) {
  const product = Store.getProducts().find((p) => p.id === productId);
  if (!product) return;
  document.getElementById('product-modal-title').textContent = `Edit Product: ${product.id}`;
  document.getElementById('prd-id').value = product.id;
  document.getElementById('prd-name').value = product.name;
  document.getElementById('prd-sku').value = product.sku;
  document.getElementById('prd-category').value = product.category;
  document.getElementById('prd-price').value = product.price;
  document.getElementById('prd-stock').value = product.stock;
  document.getElementById('prd-rating').value = product.rating;
  document.getElementById('prd-desc').value = product.description;
  document.getElementById('prd-on-sale').checked = Boolean(product.onSale);
  document.getElementById('product-modal').classList.add('open');
}

// ==================== QA AUTOMATION SANDBOX ====================
function setupSandboxChallenges() {
  // 1. Dynamic Waits & Async Elements
  const triggerAsyncBtn = document.getElementById('btn-trigger-async');
  const delayedBtn = document.getElementById('btn-delayed-enable');
  const spinner = document.getElementById('async-spinner');
  const secretBox = document.getElementById('async-secret-box');
  const tokenVal = document.getElementById('async-token-value');

  triggerAsyncBtn.addEventListener('click', () => {
    triggerAsyncBtn.disabled = true;
    delayedBtn.disabled = true;
    secretBox.style.display = 'none';
    spinner.style.display = 'block';

    setTimeout(() => {
      spinner.style.display = 'none';
      triggerAsyncBtn.disabled = false;
      delayedBtn.disabled = false;
      const generated = `ASYNC-${Math.floor(10000 + Math.random() * 90000)}`;
      tokenVal.textContent = generated;
      secretBox.style.display = 'block';
    }, 3000);
  });

  delayedBtn.addEventListener('click', () => {
    tokenVal.textContent = 'DELAYED-BUTTON-CLICKED-SUCCESS';
    secretBox.style.display = 'block';
  });

  // 2. Dynamic IDs Table
  renderDynamicIdTable();
  document.getElementById('btn-regenerate-ids').addEventListener('click', renderDynamicIdTable);

  // 3. Alerts, Confirms, Prompts & Custom Modal
  const dialogResult = document.getElementById('dialog-result');
  document.getElementById('btn-js-alert').addEventListener('click', () => {
    window.alert('QA Lab Native Alert: Verify this message!');
    dialogResult.textContent = 'Alert accepted: OK';
  });

  document.getElementById('btn-js-confirm').addEventListener('click', () => {
    const ok = window.confirm('Do you want to confirm this QA transaction?');
    dialogResult.textContent = `Confirm result: ${ok ? 'Confirmed (true)' : 'Cancelled (false)'}`;
  });

  document.getElementById('btn-js-prompt').addEventListener('click', () => {
    const val = window.prompt('Enter your automation framework name:', 'Playwright');
    dialogResult.textContent = `Prompt result: ${val !== null ? val : 'Cancelled'}`;
  });

  const sandboxModal = document.getElementById('sandbox-custom-modal');
  document.getElementById('btn-custom-modal').addEventListener('click', () => {
    document.getElementById('sandbox-modal-input').value = '';
    sandboxModal.classList.add('open');
  });
  document.getElementById('btn-close-sandbox-modal').addEventListener('click', () => {
    sandboxModal.classList.remove('open');
  });
  document.getElementById('btn-confirm-sandbox-modal').addEventListener('click', () => {
    const text = document.getElementById('sandbox-modal-input').value.trim() || 'CONFIRMED';
    sandboxModal.classList.remove('open');
    dialogResult.textContent = `Custom DOM Modal Confirmed: "${text}"`;
  });

  // 6. Drag & Drop Kanban Columns
  document.querySelectorAll('.kanban-col').forEach((col) => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      moveKanbanTask(taskId, col.dataset.status);
    });
  });

  // 7. File Upload & Download
  document.getElementById('qa-file-upload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    const res = document.getElementById('file-upload-result');
    if (files.length === 0) {
      res.textContent = 'No files uploaded yet.';
      return;
    }
    const names = files.map((f) => `${f.name} (${Math.round(f.size / 1024 || 1)} KB)`).join(', ');
    res.textContent = `Uploaded ${files.length} file(s): ${names}`;
  });

  document.getElementById('btn-download-csv').addEventListener('click', () => {
    const products = Store.getProducts();
    const header = 'ID,SKU,Name,Category,Price,Stock\n';
    const rows = products.map((p) => `${p.id},${p.sku},"${p.name}",${p.category},${p.price},${p.stock}`).join('\n');
    downloadFile('inventory-export.csv', header + rows, 'text/csv');
    document.getElementById('file-upload-result').textContent = 'Downloaded inventory-export.csv';
  });

  document.getElementById('btn-download-txt').addEventListener('click', () => {
    const content = `QA Automation Report\nGenerated: ${new Date().toISOString()}\nStatus: PASS\n`;
    downloadFile('qa-test-report.txt', content, 'text/plain');
    document.getElementById('file-upload-result').textContent = 'Downloaded qa-test-report.txt';
  });

  // 8. Hover, Double-Click & Right-Click Context Menu
  const mouseResult = document.getElementById('mouse-action-result');
  document.querySelectorAll('[data-hover-action]').forEach((item) => {
    item.addEventListener('click', () => {
      mouseResult.textContent = `Hover menu item selected: ${item.dataset.hoverAction}`;
    });
  });

  let dblClicks = 0;
  document.getElementById('btn-double-click').addEventListener('dblclick', () => {
    dblClicks += 1;
    document.getElementById('dblclick-count').textContent = String(dblClicks);
    mouseResult.textContent = `Double-click verified! Count: ${dblClicks}`;
  });

  const ctxMenu = document.getElementById('custom-context-menu');
  const ctxArea = document.getElementById('context-menu-area');
  ctxArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 180)}px`;
    ctxMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 130)}px`;
    mouseResult.textContent = 'Context menu opened via right-click';
  });

  document.querySelectorAll('[data-ctx-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      mouseResult.textContent = `Context menu action executed: ${btn.dataset.ctxAction}`;
      ctxMenu.style.display = 'none';
    });
  });

  document.addEventListener('click', () => {
    ctxMenu.style.display = 'none';
  });

  // 9. Progress Bar & Pickers
  const progBar = document.getElementById('qa-progress-bar');
  const progResult = document.getElementById('progress-result');

  const updateProgressUI = () => {
    progBar.style.width = `${progressValue}%`;
    progBar.textContent = `${progressValue}%`;
    progBar.setAttribute('aria-valuenow', String(progressValue));
  };

  document.getElementById('btn-progress-start').addEventListener('click', () => {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      progressValue = progressValue >= 100 ? 0 : progressValue + 1;
      updateProgressUI();
    }, 45);
    progResult.textContent = 'Progress bar running...';
  });

  document.getElementById('btn-progress-stop').addEventListener('click', () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    const diff = Math.abs(75 - progressValue);
    progResult.textContent =
      diff === 0
        ? `🎯 BULLSEYE! Stopped at exactly 75%!`
        : `Stopped at ${progressValue}% (Difference from 75%: ${diff}%)`;
  });

  document.getElementById('btn-progress-reset').addEventListener('click', () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    progressValue = 25;
    updateProgressUI();
    progResult.textContent = 'Progress bar reset to 25%.';
  });

  document.getElementById('qa-date-picker').addEventListener('change', (e) => {
    progResult.textContent = `Date selected: ${e.target.value}`;
  });

  document.getElementById('qa-color-picker').addEventListener('input', (e) => {
    progBar.style.backgroundColor = e.target.value;
    progResult.textContent = `Color selected: ${e.target.value}`;
  });

  // 10. Popup Window & Stale DOM Element
  document.getElementById('btn-open-popup-window').addEventListener('click', () => {
    window.open(
      'iframe-content.html?mode=popup',
      'qaPopupWindow',
      'width=520,height=420,resizable=yes,scrollbars=yes'
    );
  });

  document.getElementById('btn-recreate-stale-el').addEventListener('click', () => {
    staleGeneration += 1;
    const wrapper = document.getElementById('stale-element-wrapper');
    // Completely remove old node and insert a fresh DOM element
    wrapper.innerHTML = `
      <div class="result-banner" id="stale-target-element" data-testid="stale-target-element" data-generation="${staleGeneration}">
        Target Node Generation #${staleGeneration} (Previous element reference is now STALE)
      </div>
    `;
  });

  // 11. Lazy Infinite Scroll
  const scrollBox = document.getElementById('infinite-scroll-box');
  appendInfiniteScrollItems(10);
  scrollBox.addEventListener('scroll', () => {
    if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 15) {
      if (infiniteScrollCount < 50) {
        appendInfiniteScrollItems(10);
      }
    }
  });
}

function renderDynamicIdTable() {
  const services = [
    { name: 'Auth Gateway', cpu: '14%' },
    { name: 'Database Cluster', cpu: '68%' },
    { name: 'Payment Worker', cpu: '31%' }
  ];
  const tbody = document.getElementById('dynamic-id-tbody');
  tbody.innerHTML = services
    .map((svc) => {
      const randomId = `btn-dyn-${Math.floor(100000 + Math.random() * 900000)}`;
      return `
        <tr data-service-name="${svc.name}">
          <td><strong>${svc.name}</strong></td>
          <td>${svc.cpu}</td>
          <td>
            <button
              type="button"
              id="${randomId}"
              class="btn btn-primary btn-sm"
              data-service-action="${svc.name}"
            >
              Restart
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-service-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('dynamic-id-result').textContent =
        `Restarted [${btn.dataset.serviceAction}] via dynamic ID #${btn.id}`;
    });
  });
}

function renderKanbanBoard() {
  const kanban = Store.getKanban();
  const statuses = ['todo', 'inprogress', 'done'];
  const nextStatusMap = { todo: 'inprogress', inprogress: 'done', done: 'todo' };

  statuses.forEach((status) => {
    const items = kanban[status] || [];
    document.getElementById(`count-${status}`).textContent = String(items.length);
    const container = document.getElementById(`kanban-list-${status}`);
    container.innerHTML = items
      .map(
        (task) => `
      <div
        class="kanban-card"
        draggable="true"
        id="kanban-card-${task.id}"
        data-task-id="${task.id}"
        data-testid="kanban-card-${task.id}"
      >
        <div><strong>${task.id}</strong>: ${task.title}</div>
        <div class="kanban-card-actions">
          <span class="status-tag warning">${task.priority}</span>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            style="padding: 2px 6px; font-size: 0.72rem;"
            data-move-task="${task.id}"
            data-target-col="${nextStatusMap[status]}"
            data-testid="move-task-${task.id}"
            title="Advance task to next column"
          >
            Move ➔
          </button>
        </div>
      </div>
    `
      )
      .join('');

    container.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.taskId);
      });
    });

    container.querySelectorAll('[data-move-task]').forEach((btn) => {
      btn.addEventListener('click', () => {
        moveKanbanTask(btn.dataset.moveTask, btn.dataset.targetCol);
      });
    });
  });
}

function moveKanbanTask(taskId, targetCol) {
  const kanban = Store.getKanban();
  let foundTask = null;

  ['todo', 'inprogress', 'done'].forEach((col) => {
    const idx = (kanban[col] || []).findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      foundTask = kanban[col].splice(idx, 1)[0];
    }
  });

  if (foundTask && kanban[targetCol]) {
    kanban[targetCol].push(foundTask);
    Store.saveKanban(kanban);
    renderKanbanBoard();
  }
}

function appendInfiniteScrollItems(batchSize) {
  const box = document.getElementById('infinite-scroll-box');
  for (let i = 0; i < batchSize; i++) {
    if (infiniteScrollCount >= 50) break;
    infiniteScrollCount += 1;
    const row = document.createElement('div');
    row.className = 'scroll-row';
    row.setAttribute('data-scroll-index', String(infiniteScrollCount));
    row.setAttribute('data-testid', `scroll-item-${infiniteScrollCount}`);
    row.textContent = `Audit Log Entry #${infiniteScrollCount} — Event verified in LocalStorage`;
    box.appendChild(row);
  }
  document.getElementById('infinite-scroll-status').textContent = `Loaded ${infiniteScrollCount} of 50 items`;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
