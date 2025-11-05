// ===== Shared data =====
const PRODUCTS   = window.YGA_PRODUCTS || [];
const CATEGORIES = window.YGA_CATEGORIES || [];

// ===== Helpers =====
const $ = s => document.querySelector(s);
const currency = v => `Tk ${(+v).toLocaleString("en-US", {
  minimumFractionDigits: 2, maximumFractionDigits: 2
})}`;

// Prefer array-based images; fallback to single "image"
const primaryImage = p => {
  if (Array.isArray(p.images) && p.images.length) return p.images[0];
  return p.image || ""; // last resort
};

// Some data uses priceOld, some use compareAt (variants)
const getCompareAt = p => p.priceOld || p.compareAt || null;

// Year in footer
const y = $('#yYear'); if (y) y.textContent = new Date().getFullYear();

// Top categories
const topBar = $('#topCategories');
if (topBar) {
  topBar.innerHTML = CATEGORIES.map(c =>
    `<a class="navlink" href="shop.html?cat=${encodeURIComponent(c)}">${c}</a>`
  ).join('');
}

// ===== Get product by ?id=... =====
const params  = new URLSearchParams(location.search);
const id      = params.get('id');
const product = PRODUCTS.find(p => p.id === id);

if (!product) {
  document.body.innerHTML =
    '<div class="container" style="padding:40px 0"><h2>Product not found.</h2><p><a class="link" href="shop.html">Back to shop</a></p></div>';
  throw new Error('Product not found: ' + id);
}

// ===== Fill main info =====
$('#pTitle').textContent = product.title;

// Image (handle array)
const imgEl = $('#pImage');
if (imgEl) {
  const src = primaryImage(product);
  imgEl.src = src;
  imgEl.alt = product.title;
}

$('#pNow').textContent = currency(product.priceNow);

// Old/compare price
const topCompare = getCompareAt(product);
if (topCompare) {
  $('#pOld').hidden = false;
  $('#pOld').textContent = currency(topCompare);
} else {
  $('#pOld').hidden = true;
}

// Badges
const badges = [];
if (product.stock === 'out') badges.push('<span class="pbadge pbadge--oos">OUT OF STOCK</span>');
if (product.onSale)         badges.push('<span class="pbadge pbadge--sale">ON SALE</span>');
if (product.discountTk)     badges.push(`<span class="pbadge pbadge--discount">৳${product.discountTk} Discount</span>`);
$('#pBadges').innerHTML = badges.join('');

// ===== Variants (optional) =====
// Expect shape: [{ g, price, compareAt, default }]
const vWrap = document.getElementById('variantWrap');
if (vWrap && Array.isArray(product.variants) && product.variants.length) {
  vWrap.innerHTML = `
    <label for="variantSel" class="formlabel">Weight</label>
    <select id="variantSel" class="select">
      ${product.variants.map(v => `
        <option value="${v.g}" data-price="${v.price}" data-compare="${v.compareAt || ''}" ${v.default ? 'selected' : ''}>
          ${v.g} g — ${currency(v.price)}${v.compareAt ? ` (was ${currency(v.compareAt)})` : ''}
        </option>
      `).join('')}
    </select>
  `;

  const sel = document.getElementById('variantSel');
  const syncPrice = () => {
    const opt = sel.selectedOptions[0];
    const price = Number(opt.dataset.price || product.priceNow);
    const compare = opt.dataset.compare ? Number(opt.dataset.compare) : null;
    $('#pNow').textContent = currency(price);
    if (compare) {
      $('#pOld').hidden = false;
      $('#pOld').textContent = currency(compare);
    } else {
      $('#pOld').hidden = !topCompare;
      if (topCompare) $('#pOld').textContent = currency(topCompare);
    }
  };
  sel.addEventListener('change', syncPrice);
  syncPrice();
}

// ===== Description & tabs =====
// If you stored HTML in tabs.desc/nutrition/delivery, inject as HTML (not textContent)
const hasTabs = product.tabs && (product.tabs.desc || product.tabs.nutrition || product.tabs.delivery);

if (hasTabs) {
  const d = $('#pDesc');        if (d) d.innerHTML        = product.tabs.desc || '';
  const n = $('#pNutrition');   if (n) n.innerHTML        = product.tabs.nutrition || '';
  const dv= $('#pDelivery');    if (dv) dv.innerHTML      = product.tabs.delivery || '';
} else {
  // backward compat: simple text/desc field
  const d = $('#pDesc');
  if (d) d.textContent = product.desc || '';
}

// ===== Cart =====
const CART_KEY = 'yga_cart';
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const setCart = items => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartCount(); };
const addToCart = (pid, qty = 1) => {
  const c = getCart();
  const it = c.find(i => i.id === pid);
  if (it) it.qty += qty; else c.push({ id: pid, qty });
  setCart(c);
};
const updateCartCount = () => {
  const cnt = getCart().reduce((n, i) => n + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cnt;
};
updateCartCount();

const btnAdd = $('#btnAdd');
if (btnAdd) {
  if (product.stock === 'out') { btnAdd.disabled = true; btnAdd.textContent = 'Stock Out'; }
  btnAdd.addEventListener('click', () => {
    addToCart(product.id, 1);
    btnAdd.textContent = 'Added ✓';
    setTimeout(() => btnAdd.textContent = 'Add to cart', 900);
  });
}

// ===== WhatsApp deep link =====
const waText = encodeURIComponent(`Hello! I want to order: ${product.title} (${currency(product.priceNow)}).`);
const wa = $('#btnWhatsApp');
if (wa) wa.href = `https://wa.me/8801321208940?text=${waText}`;

// ===== Related products (share at least one category) =====
const relatedWrap = $('#related');
if (relatedWrap) {
  const rel = PRODUCTS
    .filter(p => p.id !== product.id && Array.isArray(p.categories) && p.categories.some(c => product.categories?.includes(c)))
    .slice(0, 3);

  if (rel.length) {
    relatedWrap.innerHTML = `
      <h3 style="margin:18px 0 10px">Related products</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        ${rel.map(p => `
          <a href="productsdetails.html?id=${encodeURIComponent(p.id)}"
             style="border:1px solid var(--line);border-radius:12px;padding:12px;display:block;background:#fff">
            <img src="${primaryImage(p)}" alt="${p.title}"
                 style="width:100%;height:160px;object-fit:contain;display:block">
            <div style="margin-top:8px;font-weight:600">${p.title}</div>
            <div style="font-weight:700">
              ${currency(p.priceNow)}
              ${getCompareAt(p) ? `<span class="price__old">${currency(getCompareAt(p))}</span>` : ''}
            </div>
          </a>
        `).join('')}
      </div>`;
  }
}
