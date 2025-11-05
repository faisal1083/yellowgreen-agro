/* =========================================================
   YELLOW GREEN AGRO — SHOP SCRIPT (Product page navigation)
   ========================================================= */

/* -----------------------
   Sticky header shadow
----------------------- */
const header = document.getElementById('ygaHeader');
function setShadow() {
  const y = window.scrollY || 0;
  if (!header) return;
  header.style.boxShadow = y > 2 ? '0 6px 20px rgba(0,0,0,.08)' : 'var(--shadow)';
}
window.addEventListener('scroll', setShadow);
setShadow();

// Fixed-header offset (prevents content from hiding under the header)
const setHeadOffset = () => {
  if (!header) return;
  const h = header.offsetHeight;
  document.documentElement.style.setProperty('--head-h', h + 'px');
  document.body.classList.add('has-fixed-header');
};
window.addEventListener('load', setHeadOffset);
window.addEventListener('resize', setHeadOffset);
setHeadOffset();


/* -----------------------
   Mobile panel toggle
----------------------- */
const hamburger = document.getElementById('hamburger');
const panel = document.getElementById('mobilePanel');
if (hamburger && panel) {
  hamburger.addEventListener('click', () => {
    const open = !panel.hasAttribute('hidden');
    if (open) {
      panel.setAttribute('hidden', '');
      hamburger.setAttribute('aria-expanded', 'false');
    } else {
      panel.removeAttribute('hidden');
      hamburger.setAttribute('aria-expanded', 'true');
    }
  });
}

/* -----------------------
   Cart bump (demo)
----------------------- */
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
if (cartButton && cartCount) {
  cartButton.addEventListener('click', () => {
    cartCount.textContent = (parseInt(cartCount.textContent || '0', 10) + 1).toString();
  });
}

/* -----------------------
   Search (no reload)
----------------------- */
const searchForm = document.querySelector('.search');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (document.getElementById('searchInput')?.value || '').trim();
    if (!val) return;
    alert(`Search: ${val}`); // TODO hook real search
  });
}

/* =========================================================
   CATEGORIES + PLACEHOLDERS
========================================================= */
const CATEGORIES = [
  { name: "Poultry & Meat",        key: "poultry",    hero: "assets/hero/poultry.jpg" },
  { name: "Honey",                 key: "honey",      hero: "assets/hero/honey.jpg" },
  { name: "Rice, Pulse & Grains",  key: "grains",     hero: "assets/hero/grains.jpg" },
  { name: "Oils",                  key: "oils",       hero: "assets/hero/oils.jpg" },
  { name: "Signature Series",      key: "signature",  hero: "assets/hero/signature.jpg" },
  { name: "Sweeteners & Dairy",    key: "dairy",      hero: "assets/hero/dairy.jpg" },
  { name: "Spices",                key: "spices",     hero: "assets/hero/spices.jpg" },
  { name: "Super Foods",           key: "superfoods", hero: "assets/hero/superfoods.jpg" },
  { name: "Tea, Snacks & Drinks",  key: "snacks",     hero: "assets/hero/snacks.jpg" },
  { name: "Nuts & Dates",          key: "nuts",       hero: "assets/hero/nuts.jpg" },
  { name: "Pickle & Chutney",      key: "pickle",     hero: "assets/hero/pickle.jpg" },
];

// Inline SVG placeholder
const ph = (text) =>
  `data:image/svg+xml;utf8,` + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'>
      <rect width='100%' height='100%' fill='#E9F0EA'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Inter,Arial' font-weight='700' font-size='28' fill='#8AA08A'>${text}</text>
    </svg>`
  );

/* =========================================================
   DROPDOWN: Browse Categories
========================================================= */
const catTrigger  = document.getElementById('catTrigger');
const catDropdown = document.getElementById('catDropdown');
const catMenu     = document.getElementById('catMenu');

function buildCategoryMenu() {
  if (!catMenu) return;
  catMenu.innerHTML = CATEGORIES.map(c =>
    `<li><a href="#" data-cat="${c.key}">${c.name}</a></li>`
  ).join("");

  // client-side navigation (no reload)
  catMenu.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-cat]');
    if (!a) return;
    e.preventDefault();
    const key = a.getAttribute('data-cat');
    history.pushState({}, "", `?cat=${encodeURIComponent(key)}`);
    route();
    closeCats();
  });
}

function openCats() {
  if (!catTrigger || !catDropdown) return;
  catDropdown.removeAttribute('hidden');
  catTrigger.setAttribute('aria-expanded', 'true');
  setTimeout(() => {
    document.addEventListener('click', outsideCats);
    document.addEventListener('keydown', escCats);
  }, 0);
}
function closeCats() {
  if (!catTrigger || !catDropdown) return;
  catDropdown.setAttribute('hidden','');
  catTrigger.setAttribute('aria-expanded','false');
  document.removeEventListener('click', outsideCats);
  document.removeEventListener('keydown', escCats);
}
function outsideCats(e){ if (!catDropdown.contains(e.target) && !catTrigger.contains(e.target)) closeCats(); }
function escCats(e){ if (e.key === 'Escape') closeCats(); }

if (catTrigger && catDropdown) {
  catTrigger.addEventListener('click', () => {
    const open = catTrigger.getAttribute('aria-expanded') === 'true';
    open ? closeCats() : openCats();
  });
}
buildCategoryMenu();

/* =========================================================
   PRODUCT DATA (mock) + RENDER HELPERS
========================================================= */
// Preview list (home sections)
function mockProducts(catKey) {
  const base = [
    { name: "Beef (Bone-in)",  price: 800, size: "1 kg" },
    { name: "Beijing Duck",   price: 640, size: "1 kg",  priceOld: 700 },
    { name: "Buffalo Meat",   price: 850, size: "1 kg" },
    { name: "Deshi Chicken",  price: 1015, size: "1 kg", priceOld: 1090 },
    { name: "Chicken Wings",  price: 420, size: "500 g" },
  ];
  return base.map((b, i) => ({
    id: `${catKey}-${i+1}`,
    catKey,
    name: b.name,
    price: b.price,
    priceOld: b.priceOld || null,
    size: b.size,
    img: ph(`${catKey} ${i+1}`),
  }));
}

// Full list (category page + for product page later)
function mockProductsAll(catKey) {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const base = 380 + (n * 25);
    const discounted = n % 3 === 0 ? base - 40 : base;
    const priceOld = discounted < base ? base : null;
    const imgs = [ ph(`${catKey} ${n}`), ph(`${catKey} ${n} - 2`), ph(`${catKey} ${n} - 3`) ];
    return {
      id: `${catKey}-${n}`,
      catKey,
      name: `${catKey.charAt(0).toUpperCase() + catKey.slice(1)} Item ${n}`,
      price: discounted,
      priceOld,
      size: n % 2 ? "1 kg" : "500 g",
      img: imgs[0],
      images: imgs,
      desc: `Short description of ${catKey} item ${n}. Replace with real text.`,
    };
  });
}

function discountPercent(p){ 
  if (!p.priceOld || p.priceOld <= p.price) return null;
  return Math.round(100 - (p.price / p.priceOld) * 100);
}

// Build product details link (NEW PAGE)
function productLink(p){
  const catKey = p.catKey || (p.id ? p.id.split('-')[0] : 'cat');
  return `product.html?cat=${encodeURIComponent(catKey)}&id=${encodeURIComponent(p.id)}`;
}

function cardHTML(p) {
  const off = discountPercent(p);
  const href = productLink(p);
  return `
    <article class="prod-card" data-id="${p.id}">
      <a class="prod-media" href="${href}">
        ${off ? `<span class="ribbon">-${off}%</span>` : ""}
        <img src="${p.img}" alt="${p.name}" onerror="this.remove();this.closest('.prod-media').insertAdjacentHTML('beforeend','<div class=&quot;ph&quot;>Image</div>')">
      </a>
      <div class="prod-body">
        <a class="prod-name" href="${href}">${p.name}</a>
        <div class="badges">
          <span class="badge">৳ ${p.price}</span>
          ${p.priceOld ? `<span class="price-old">৳ ${p.priceOld}</span>` : ""}
          <span class="badge dark">${p.size}</span>
        </div>
        <button class="cta" data-add="${p.id}">ADD TO CART</button>
      </div>
    </article>
  `;
}

function heroHTML(cat){
  const src = cat.hero || ph(`${cat.name} hero`);
  return `
    <div class="cat-hero">
      <a href="?cat=${encodeURIComponent(cat.key)}" aria-label="${cat.name}">
        <img src="${src}" alt="${cat.name}"
             onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'${cat.name}'}))">
      </a>
    </div>
  `;
}

function sectionHTML(cat) {
  const all = mockProducts(cat.key);
  const shown = all.slice(0, 4);
  const moreCount = Math.max(0, all.length - shown.length);

  return `
    <div class="cat-block" id="cat-${cat.key}">
      <div class="cat-head">
        <h2 class="cat-title">${cat.name}</h2>
        <button class="cat-more" data-go="${cat.key}">
          ${moreCount ? `View more (${moreCount})` : "See details »"}
        </button>
      </div>

      <div class="cat-row">
        ${heroHTML(cat)}
        ${shown.map(cardHTML).join("")}
      </div>
    </div>
  `;
}

/* =========================================================
   ROUTER (home vs category page)
========================================================= */
const catalogMount = document.getElementById("catalogMount");

function getCatFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get('cat'); // e.g. "honey"
}

function renderHomePage() {
  if (!catalogMount) return;
  document.querySelector('.promo-block')?.removeAttribute('hidden');
  catalogMount.innerHTML = CATEGORIES.map(sectionHTML).join("");
}

/* ----- CATEGORY PAGE: uniform grid (no oversized tiles) ----- */
function renderCategoryPage(catKey) {
  const cat   = CATEGORIES.find(c => c.key === catKey);
  const mount = document.getElementById('catalogMount');
  if (!cat || !mount) return;

  // hide hero/promo on category view
  document.querySelector('.promo-block')?.setAttribute('hidden', '');

  // get ALL products for this category
  const all = mockProductsAll(cat.key);    // returns an array with price/size/images…

  // build a plain grid of standard cards (no hero, no large placeholders)
  mount.innerHTML = `
    <div class="cat-block" id="cat-${cat.key}">
      <div class="cat-head">
        <h2 class="cat-title">${cat.name}</h2>
        <button class="cat-more" onclick="history.back()">« Back</button>
      </div>

      <div class="prod-grid">
        ${all.map(cardHTML).join("")}
      </div>
    </div>
  `;
}

function route() {
  const cat = getCatFromURL();
  if (cat) renderCategoryPage(cat);
  else renderHomePage();
}
window.addEventListener('popstate', route);
route();

/* =========================================================
   INTERACTIONS (add to cart, view more)
========================================================= */
catalogMount?.addEventListener('click', (e) => {
  // add to cart
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    e.stopPropagation();
    cartCount.textContent = (parseInt(cartCount.textContent || '0', 10) + 1).toString();
    const original = addBtn.textContent;
    addBtn.textContent = 'ADDED ✓';
    setTimeout(() => addBtn.textContent = original, 900);
    return;
  }

  // "View more" -> navigate to category
  const more = e.target.closest('[data-go]');
  if (more) {
    const key = more.getAttribute('data-go');
    history.pushState({}, "", `?cat=${encodeURIComponent(key)}`);
    route();
  }
}, true);

/* -----------------------
   Footer: dynamic year
----------------------- */
document.getElementById('yearSpan')?.append(new Date().getFullYear());
