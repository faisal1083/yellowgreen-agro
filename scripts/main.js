// HERO slider
const heroSlides = Array.from(document.querySelectorAll('.hero__slide'));
const heroDotsWrap = document.querySelector('.hero__dots');
let heroIdx = 0, heroTimer;

function renderHeroDots() {
  if (!heroDotsWrap || !heroSlides.length) return;
  heroDotsWrap.innerHTML = '';
  heroSlides.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === heroIdx) b.classList.add('active');
    b.addEventListener('click', () => goHero(i, true));
    heroDotsWrap.appendChild(b);
  });
}

function goHero(i, manual=false) {
  heroSlides[heroIdx]?.classList.remove('active');
  heroIdx = (i + heroSlides.length) % heroSlides.length;
  heroSlides[heroIdx]?.classList.add('active');
  renderHeroDots();
  if (manual) restartHero();
}

function nextHero(){ goHero(heroIdx + 1); }
function startHero(){ heroTimer = setInterval(nextHero, 4500); }
function stopHero(){ clearInterval(heroTimer); }
function restartHero(){ stopHero(); startHero(); }

if (heroSlides.length) {
  heroSlides[0].classList.add('active');
  renderHeroDots();
  startHero();
  const heroEl = document.querySelector('.hero__slides');
  heroEl.addEventListener('mouseenter', stopHero);
  heroEl.addEventListener('mouseleave', startHero);
}
