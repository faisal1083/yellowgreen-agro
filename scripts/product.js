/* =========================================================
   PRODUCT PAGE — details + related
========================================================= */

/* Header shadow */
const header = document.getElementById('ygaHeader');
window.addEventListener('scroll', () => {
  const y = window.scrollY || 0;
  if (header) header.style.boxShadow = y > 2 ? '0 6px 20px rgba(0,0,0,.08)' : 'var(--shadow)';
});

/* Cart bump demo */
const cartButton = document.getElementById('cartButton');
const cartCount  = document.getElementById('cartCount');
cartButton?.addEventListener('click', () => {
  cartCount.textContent = (parseInt(cartCount.textContent || '0', 10) + 1).toString();
});

/* Search (stub) */
document.querySelector('.search')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = (document.getElementById('searchInput')?.value || '').trim();
  if (val) alert(`Search: ${val}`);
});

/* Footer year */
document.getElementById('yearSpan')?.append(new Date().getFullYear());

/* ---------- Data (match shop.js) ---------- */
const CATEGORIES = [
  { name: "Poultry & Meat", key: "poultry" },
  { name: "Honey", key: "honey" },
  { name: "Rice, Pulse & Grains", key: "grains" },
  { name: "Oils", key: "oils" },
  { name: "Signature Series", key: "signature" },
  { name: "Sweeteners & Dairy", key: "dairy" },
  { name: "Spices", key: "spices" },
  { name: "Super Foods", key: "superfoods" },
  { name: "Tea, Snacks & Drinks", key: "snacks" },
  { name: "Nuts & Dates", key: "nuts" },
  { name: "Pickle & Chutney", key: "pickle" },
];

const ph = (text) =>
  `data:image/svg+xml;utf8,` + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'>
      <rect width='100%' height='100%' fill='#E9F0EA'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Inter,Arial' font-weight='700' font-size='28' fill='#8AA08A'>${text}</text>
    </svg>`
  );

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
      images: imgs,
      img: imgs[0],
      desc: `Short description of ${catKey} item ${n}. Natural, genuine and quality controlled. (Replace with real content.)`
    };
  });
}

function discountPercent(p){ 
  if (!p.priceOld || p.priceOld <= p.price) return null;
  return Math.round(100 - (p.price / p.priceOld) * 100);
}

/* ---------- URL params ---------- */
const params = new URLSearchParams(location.search);
const catKey = params.get('cat') || '';
const productId = params.get('id') || '';

/* ---------- DOM refs ---------- */
const productSection = document.getElementById('productSection');
const relatedRow     = document.getElementById('relatedRow');
const breadcrumb     = document.getElementById('breadcrumb');
const backToCatLink  = document.getElementById('backToCat');

/* ---------- Render ---------- */
function productLink(p){
  const key = p.catKey || (p.id ? p.id.split('-')[0] : 'cat');
  return `product.html?cat=${encodeURIComponent(key)}&id=${encodeURIComponent(p.id)}`;
}

function renderProduct(p) {
  const off = discountPercent(p);
  const cat = CATEGORIES.find(c=>c.key===p.catKey);

  breadcrumb.innerHTML = `
    <a href="shop.html">Home</a> / 
    <a href="shop.html?cat=${encodeURIComponent(p.catKey)}">${cat?.name || p.catKey}</a> /
    <span>${p.name}</span>
  `;

  productSection.innerHTML = `
    <div class="media">
      <div id="zoomBox" class="zoom-box"></div>
      <div id="thumbs" class="pm-thumbs"></div>
    </div>

    <div class="info">
      <h1 class="title">${p.name}</h1>
      <div class="sku">Product ID: ${p.id}</div>

      <div class="price">
        <span class="now">৳ ${p.price}</span>
        ${p.priceOld ? `<span class="old">৳ ${p.priceOld}</span>` : ''}
        ${off ? `<span class="badge dark">-${off}%</span>` : ''}
      </div>

      <div class="badges">
        <span class="badge">${p.size}</span>
      </div>

      <div class="actions">
        <button id="addToCart" class="btn primary">ADD TO CART</button>
        <a class="btn" href="shop.html?cat=${encodeURIComponent(p.catKey)}">More from ${cat?.name || p.catKey}</a>
      </div>

      <div class="description">
        <h3>Description</h3>
        <p>${p.desc}</p>
      </div>
    </div>
  `;

  // images + zoom
  const zoomBox = document.getElementById('zoomBox');
  const thumbs  = document.getElementById('thumbs');

  function setBG(i){ zoomBox.style.backgroundImage = `url('${p.images[i]}')`; }
  setBG(0);
  thumbs.innerHTML = p.images.map((src,i)=>`<img src="${src}" data-i="${i}" class="${i===0?'active':''}" alt="thumb ${i+1}">`).join('');
  thumbs.onclick = (e)=>{
    const img = e.target.closest('img[data-i]'); if (!img) return;
    thumbs.querySelectorAll('img').forEach(n=>n.classList.remove('active'));
    img.classList.add('active'); setBG(+img.dataset.i);
  };

  // zoom
  let zoomed = false;
  function setPos(x,y){ zoomBox.style.backgroundPosition = `${x}% ${y}%`; }
  function toPctFromMouse(ev){
    const r = zoomBox.getBoundingClientRect();
    const x = Math.min(Math.max(0, (ev.clientX - r.left)/r.width), 1);
    const y = Math.min(Math.max(0, (ev.clientY - r.top)/r.height), 1);
    return [x*100, y*100];
  }
  zoomBox.onmousedown = (e)=>{ zoomed=!zoomed; zoomBox.classList.toggle('zoomed',zoomed); if (zoomed){ const [x,y]=toPctFromMouse(e); setPos(x,y);} };
  zoomBox.onmousemove = (e)=>{ if (zoomed){ const [x,y]=toPctFromMouse(e); setPos(x,y);} };
  zoomBox.ontouchstart = (e)=>{ zoomed=!zoomed; zoomBox.classList.toggle('zoomed',zoomed); if (zoomed&&e.touches[0]){ const t=e.touches[0]; const r=zoomBox.getBoundingClientRect(); const x=(t.clientX-r.left)/r.width*100; const y=(t.clientY-r.top)/r.height*100; setPos(x,y);} };
  zoomBox.ontouchmove  = (e)=>{ if(!zoomed||!e.touches[0])return; const t=e.touches[0]; const r=zoomBox.getBoundingClientRect(); const x=(t.clientX-r.left)/r.width*100; const y=(t.clientY-r.top)/r.height*100; setPos(x,y); };

  // add to cart
  document.getElementById('addToCart')?.addEventListener('click', ()=>{
    cartCount.textContent = (parseInt(cartCount.textContent || '0', 10) + 1).toString();
  });

  // related
  const list = mockProductsAll(p.catKey).filter(x=>x.id!==p.id).slice(0,12);
  relatedRow.innerHTML = list.map(x => `
    <article class="prod-card">
      <a class="prod-media" href="${productLink(x)}" style="position:relative">
        ${discountPercent(x) ? `<span class="ribbon">-${discountPercent(x)}%</span>` : ''}
        <img src="${x.img}" alt="${x.name}">
      </a>
      <div class="prod-body">
        <div class="prod-name">${x.name}</div>
        <div class="badges">
          <span class="badge">৳ ${x.price}</span>
          <span class="badge dark">${x.size}</span>
        </div>
      </div>
    </article>
  `).join('');

  // back to category
  backToCatLink.href = `shop.html?cat=${encodeURIComponent(p.catKey)}`;
}

/* ---------- Start ---------- */
(function init(){
  const cat = CATEGORIES.find(c=>c.key===catKey);
  const list = cat ? mockProductsAll(catKey) : [];
  const product = list.find(p=>p.id===productId);

  if (!cat || !product) {
    breadcrumb.innerHTML = `<a href="shop.html">Home</a> / <span>Product</span>`;
    productSection.innerHTML = `
      <div class="info" style="grid-column:1/-1;text-align:center">
        <h1 class="title">Product not found</h1>
        <p class="sku">The product you're looking for doesn’t exist or the link is broken.</p>
        <div class="actions" style="justify-content:center">
          <a class="btn primary" href="shop.html">Go to Shop</a>
        </div>
      </div>`;
    relatedRow.innerHTML = '';
    backToCatLink.style.display = 'none';
    return;
  }

  renderProduct(product);
})();
