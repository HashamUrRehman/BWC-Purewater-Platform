/**
 * Bwc Purewater — Landing Page Application
 * Pricing estimator, comparison slider, navigation, forms, and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNav();
  initPricingEstimator();
  initComparisonSlider();
  initTestimonialCarousel();
  initFAQ();
  initContactForm();
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = menu.querySelectorAll('.mobile-nav-link, a[href="#contact"]');

  const closeMenu = () => {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    menu.classList.toggle('open', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.forEach(link => link.addEventListener('click', closeMenu));
  menu.querySelector('.mobile-menu-backdrop')?.addEventListener('click', closeMenu);
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach(el => observer.observe(el));
}

/* --- Active Navigation Highlighting --- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' }
  );

  sections.forEach(section => observer.observe(section));
}

/* --- Animated Number Counter --- */
function animateNumber(element, targetValue, duration = 500) {
  const startValue = parseInt(element.textContent, 10) || 0;
  const diff = targetValue - startValue;
  if (diff === 0) return;

  element.classList.add('updating');
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(startValue + diff * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.classList.remove('updating');
    }
  }

  requestAnimationFrame(update);
}

/* --- Pricing Estimator --- */
function initPricingEstimator() {
  const sizeLabels = ['Small', 'Medium', 'Large', 'Extra Large'];
  const residentialBase = [
    { min: 99, max: 149, hours: 1, package: 'Essential Clean' },
    { min: 150, max: 250, hours: 2, package: 'Standard Clean' },
    { min: 275, max: 425, hours: 3, package: 'Premium Clean' },
    { min: 450, max: 700, hours: 5, package: 'Luxury Estate Package' },
  ];
  const commercialBase = [
    { min: 199, max: 349, hours: 2, package: 'Commercial Basic' },
    { min: 350, max: 550, hours: 4, package: 'Commercial Standard' },
    { min: 575, max: 850, hours: 6, package: 'Commercial Premium' },
    { min: 900, max: 1400, hours: 8, package: 'Enterprise Maintenance' },
  ];
  const extras = { gutter: 80, pressure: 120, interior: 60 };

  const slider = document.getElementById('size-slider');
  const sizeLabel = document.getElementById('size-label');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const serviceTime = document.getElementById('service-time');
  const recommendedPackage = document.getElementById('recommended-package');

  function calculate() {
    const propertyType = document.querySelector('input[name="property-type"]:checked').value;
    const sizeIndex = parseInt(slider.value, 10);
    const baseTable = propertyType === 'commercial' ? commercialBase : residentialBase;
    const base = baseTable[sizeIndex];

    let extraTotal = 0;
    document.querySelectorAll('input[name="extra"]:checked').forEach(cb => {
      extraTotal += extras[cb.value] || 0;
    });

    const minPrice = base.min + extraTotal;
    const maxPrice = base.max + extraTotal;
    const hours = base.hours + (extraTotal > 0 ? Math.ceil(extraTotal / 100) : 0);

    sizeLabel.textContent = sizeLabels[sizeIndex];
    slider.setAttribute('aria-valuenow', sizeIndex);

    animateNumber(priceMin, minPrice);
    animateNumber(priceMax, maxPrice);
    animateNumber(serviceTime, hours);

    recommendedPackage.style.opacity = '0';
    setTimeout(() => {
      recommendedPackage.textContent = base.package;
      recommendedPackage.style.opacity = '1';
    }, 200);
  }

  slider.addEventListener('input', calculate);
  document.querySelectorAll('input[name="property-type"]').forEach(r => r.addEventListener('change', calculate));
  document.querySelectorAll('input[name="extra"]').forEach(c => c.addEventListener('change', calculate));
  calculate();
}

/* --- Before/After Comparison Slider --- */
function initComparisonSlider() {
  const container = document.querySelector('.comparison-container');
  const beforeWrap = document.getElementById('comparison-before-wrap');
  const handle = document.getElementById('comparison-handle');
  if (!container || !beforeWrap || !handle) return;

  let isDragging = false;

  function setPosition(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    beforeWrap.style.width = `${clamped}%`;
    handle.style.left = `${clamped}%`;
    handle.setAttribute('aria-valuenow', Math.round(clamped));
  }

  function syncBeforeImageWidth() {
    const beforeImg = beforeWrap.querySelector('.comparison-before-img');
    if (beforeImg) beforeImg.style.width = `${container.offsetWidth}px`;
  }

  syncBeforeImageWidth();
  window.addEventListener('resize', syncBeforeImageWidth, { passive: true });

  function getPercent(clientX) {
    const rect = container.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function startDrag(e) {
    isDragging = true;
    container.style.cursor = 'ew-resize';
  }

  function onDrag(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setPosition(getPercent(clientX));
  }

  function stopDrag() {
    isDragging = false;
    container.style.cursor = '';
  }

  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  container.addEventListener('click', (e) => {
    if (e.target === handle || handle.contains(e.target)) return;
    setPosition(getPercent(e.clientX));
  });

  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.style.left) || 50;
    if (e.key === 'ArrowLeft') setPosition(current - 2);
    if (e.key === 'ArrowRight') setPosition(current + 2);
  });

  setPosition(50);
}

/* --- Testimonial Carousel --- */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonial-dots');
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoplayInterval;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  function startAutoplay() {
    autoplayInterval = setInterval(() => goTo(current + 1), 6000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  prevBtn.addEventListener('click', resetAutoplay);
  nextBtn.addEventListener('click', resetAutoplay);
  startAutoplay();
}

/* --- FAQ Accordion --- */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --- Contact Form Validation --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  const validators = {
    fullName: (v) => v.trim().length >= 2 || 'Please enter your full name',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email',
    phone: (v) => /^[\d\s\-()+]{10,}$/.test(v.replace(/\s/g, '')) || 'Please enter a valid phone number',
    service: (v) => v !== '' || 'Please select a service',
    propertyType: (v) => v !== '' || 'Please select a property type',
  };

  function validateField(input) {
    const name = input.name;
    const validator = validators[name];
    const errorEl = input.closest('.form-group').querySelector('.error-msg');

    if (!validator) {
      input.classList.remove('error');
      errorEl.textContent = '';
      return true;
    }

    const result = validator(input.value);
    if (result === true) {
      input.classList.remove('error');
      errorEl.textContent = '';
      return true;
    }

    input.classList.add('error');
    errorEl.textContent = result;
    return false;
  }

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input && !validateField(input)) isValid = false;
    });

    if (!isValid) return;

    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      submitBtn.disabled = false;
      successMsg.classList.remove('hidden');
      setTimeout(() => successMsg.classList.add('hidden'), 5000);
    }, 1500);
  });
}
