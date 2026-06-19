(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.main-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let timer = null;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === activeSlide);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeSlide);
    });
  };

  const startHero = () => {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => showSlide(activeSlide + 1), 5200);
  };

  document.querySelector('[data-hero-prev]')?.addEventListener('click', () => {
    showSlide(activeSlide - 1);
    startHero();
  });

  document.querySelector('[data-hero-next]')?.addEventListener('click', () => {
    showSlide(activeSlide + 1);
    startHero();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      startHero();
    });
  });

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  const areas = document.querySelectorAll('[data-search-area]');

  areas.forEach((area) => {
    const container = area.parentElement || document;
    const input = area.querySelector('[data-search-input]');
    const yearSelect = area.querySelector('[data-filter-year]');
    const typeSelect = area.querySelector('[data-filter-type]');
    const count = area.querySelector('[data-filter-count]');
    const cards = Array.from(container.querySelectorAll('[data-card]'));

    const years = [...new Set(cards.map((card) => card.dataset.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
    const types = [...new Set(cards.map((card) => card.dataset.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

    years.forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect?.appendChild(option);
    });

    types.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect?.appendChild(option);
    });

    const apply = () => {
      const query = (input?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = `${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.dataset.year || ''} ${card.dataset.type || ''}`.toLowerCase();
        const okQuery = !query || haystack.includes(query);
        const okYear = !year || card.dataset.year === year;
        const okType = !type || card.dataset.type === type;
        const show = okQuery && okYear && okType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 条，共 ${cards.length} 条`;
      }
    };

    input?.addEventListener('input', apply);
    yearSelect?.addEventListener('change', apply);
    typeSelect?.addEventListener('change', apply);
    apply();
  });
})();
