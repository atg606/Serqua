const slider = document.querySelector('[data-mag-slider]');

if (slider) {
  const track = slider.querySelector('[data-slider-track]');
  const slides = [...slider.querySelectorAll('[data-slide]')];
  const currentLabel = slider.querySelector('[data-slider-current]');
  const totalLabel = slider.querySelector('[data-slider-total]');
  const previousButton = slider.querySelector('[data-slider-prev]');
  const nextButton = slider.querySelector('[data-slider-next]');
  let activeIndex = 0;
  let pointerStart = null;

  totalLabel.textContent = String(slides.length).padStart(2, '0');

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
    currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', String(slideIndex !== activeIndex));
    });
  }

  previousButton?.addEventListener('click', () => showSlide(activeIndex - 1));
  nextButton?.addEventListener('click', () => showSlide(activeIndex + 1));
  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
  });
  slider.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    pointerStart = event.clientX;
    slider.setPointerCapture(event.pointerId);
  });
  slider.addEventListener('pointerup', (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    pointerStart = null;
  });
  slider.addEventListener('pointercancel', () => {
    pointerStart = null;
  });

  showSlide(0);
}

const editorial = document.querySelector('[data-editorial-slider]');
if (editorial) {
  const pages = [...editorial.querySelectorAll('[data-editorial-slide]')];
  const previous = editorial.querySelector('[data-editorial-prev]');
  const next = editorial.querySelector('[data-editorial-next]');
  const count = editorial.querySelector('[data-editorial-count]');
  const viewport = editorial.querySelector('.mag-editorial__viewport');
  let page = 0;
  let touchStart = null;
  function turnPage(index) {
    page = (index + pages.length) % pages.length;
    pages.forEach((figure, i) => { figure.hidden = i !== page; });
    count.textContent = `${String(page + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
  }
  previous.addEventListener('click', () => turnPage(page - 1));
  next.addEventListener('click', () => turnPage(page + 1));
  editorial.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    turnPage(page + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewport.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  viewport.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) turnPage(page + (dx < 0 ? 1 : -1));
    touchStart = null;
  });
  viewport.addEventListener('touchcancel', () => { touchStart = null; });
  turnPage(0);
}

