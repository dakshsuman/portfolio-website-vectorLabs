/* ============================================================
   NORTH VECTOR LABS — Premium Interactive Agency
   JavaScript Engine v2 — Award-Level
   ============================================================ */

(() => {
    'use strict';

    /* ========== UTILITIES ========== */
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);
    const raf = cb => requestAnimationFrame(cb);
    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = matchMedia('(pointer: coarse)').matches;

    /* ========== LOADER ========== */
    const loader = $('#loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('is-hidden');
            document.body.style.overflow = '';
            initRevealObserver();
            greetReturningUser();
            initTimelineScroll();
        }, 2000);
    });
    document.body.style.overflow = 'hidden';

    /* ========== SMART PERSONALIZATION ========== */
    function greetReturningUser() {
        const key = 'nvl_visits';
        let visits = parseInt(localStorage.getItem(key) || '0', 10);
        visits++;
        localStorage.setItem(key, visits);
        if (visits > 1) {
            const heroTag = $('.hero__tag');
            if (heroTag) heroTag.textContent = `Welcome back — Visit #${visits}`;
        }
    }

    /* ========== SCROLL PROGRESS ========== */
    const scrollProgressEl = $('#scrollProgress');
    function updateScrollProgress() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgressEl.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    /* ========== NAVBAR ========== */
    const navbar = $('#navbar');
    const navBurger = $('#navBurger');
    const navLinks = $('#navLinks');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 60);
    }, { passive: true });
    navBurger.addEventListener('click', () => {
        const open = navBurger.classList.toggle('is-open');
        navLinks.classList.toggle('is-open', open);
        navBurger.setAttribute('aria-expanded', open);
    });
    $$('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
            navBurger.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            navBurger.setAttribute('aria-expanded', 'false');
        });
    });
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = $(a.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    /* ========== CUSTOM CURSOR — Enhanced ========== */
    if (!isTouchDevice) {
        const cursor = $('#cursor');
        const cursorLabel = $('.cursor__label');
        let cx = 0, cy = 0, tx = 0, ty = 0;

        document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

        function animateCursor() {
            cx = lerp(cx, tx, 0.12);
            cy = lerp(cy, ty, 0.12);
            cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
            raf(animateCursor);
        }
        raf(animateCursor);

        document.addEventListener('mouseover', e => {
            const el = e.target.closest('[data-cursor]');
            cursor.className = 'cursor';
            cursorLabel.textContent = '';
            if (el) {
                const type = el.dataset.cursor;
                cursor.classList.add('is-' + type);
                if (type === 'view') cursorLabel.textContent = 'VIEW';
            }
        });

        // Click shrink
        document.addEventListener('mousedown', () => cursor.classList.add('is-click'));
        document.addEventListener('mouseup', () => cursor.classList.remove('is-click'));
    }

    /* ========== HERO CANVAS — Gradient Mesh + Particles ========== */
    const heroCanvas = $('#heroCanvas');
    const particleCanvas = $('.hero__particles');

    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let W, H;
        let mouseX = 0.5, mouseY = 0.5;

        function resizeHeroCanvas() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            W = heroCanvas.clientWidth; H = heroCanvas.clientHeight;
            heroCanvas.width = W * dpr; heroCanvas.height = H * dpr;
            ctx.scale(dpr, dpr);
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas);

        const blobs = [
            { ox: 0.25, oy: 0.25, r: 300, color: 'rgba(123,97,255,.2)', phase: 0 },
            { ox: 0.75, oy: 0.45, r: 260, color: 'rgba(0,207,254,.14)', phase: 2 },
            { ox: 0.5, oy: 0.75, r: 240, color: 'rgba(224,86,160,.1)', phase: 4 },
            { ox: 0.15, oy: 0.85, r: 200, color: 'rgba(123,97,255,.1)', phase: 6 },
            { ox: 0.85, oy: 0.15, r: 180, color: 'rgba(0,207,254,.08)', phase: 3 },
        ];

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
        });

        function drawHero() {
            ctx.clearRect(0, 0, W, H);
            blobs.forEach(b => {
                b.phase += 0.006;
                const dx = Math.sin(b.phase * 1.1) * 0.1 + (mouseX - 0.5) * 0.08;
                const dy = Math.cos(b.phase * 0.8) * 0.1 + (mouseY - 0.5) * 0.08;
                const bx = (b.ox + dx) * W;
                const by = (b.oy + dy) * H;
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
                grad.addColorStop(0, b.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bx, by, b.r, 0, Math.PI * 2);
                ctx.fill();
            });
            raf(drawHero);
        }
        drawHero();
    }

    /* ========== HERO PARTICLE FIELD ========== */
    if (particleCanvas) {
        const pCtx = particleCanvas.getContext('2d');
        let pW, pH;
        const particles = [];

        function resizeParticles() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            pW = particleCanvas.clientWidth; pH = particleCanvas.clientHeight;
            particleCanvas.width = pW * dpr; particleCanvas.height = pH * dpr;
            pCtx.scale(dpr, dpr);
        }
        resizeParticles();
        window.addEventListener('resize', resizeParticles);

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * 2000, y: Math.random() * 1200,
                r: Math.random() * 1.5 + 0.3,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                o: Math.random() * 0.25 + 0.05,
            });
        }

        function drawParticles() {
            pCtx.clearRect(0, 0, pW, pH);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = pW; if (p.x > pW) p.x = 0;
                if (p.y < 0) p.y = pH; if (p.y > pH) p.y = 0;
                pCtx.beginPath();
                pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                pCtx.fillStyle = `rgba(255,255,255,${p.o})`;
                pCtx.fill();
            });
            raf(drawParticles);
        }
        drawParticles();
    }

    /* ========== HERO GLOW (follows cursor) ========== */
    const heroGlow = $('#heroGlow');
    if (heroGlow && !isTouchDevice) {
        let gx = 0, gy = 0, gtx = 0, gty = 0;
        document.addEventListener('mousemove', e => { gtx = e.clientX - 300; gty = e.clientY - 300; });
        function animateGlow() {
            gx = lerp(gx, gtx, 0.05); gy = lerp(gy, gty, 0.05);
            heroGlow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            raf(animateGlow);
        }
        raf(animateGlow);
    }

    /* ========== HERO 3D OBJECT — Aggressive mouse response ========== */
    const hero3d = $('#hero3dObject');
    if (hero3d && !isTouchDevice) {
        let h3dRx = 0, h3dRy = 0, h3dTx = 0, h3dTy = 0;
        document.addEventListener('mousemove', e => {
            h3dTx = ((e.clientY / window.innerHeight) - 0.5) * 35;
            h3dTy = ((e.clientX / window.innerWidth) - 0.5) * 35;
        });
        function animateHero3d() {
            h3dRx = lerp(h3dRx, h3dTx, 0.06);
            h3dRy = lerp(h3dRy, h3dTy, 0.06);
            hero3d.style.transform = `rotateX(${h3dRx}deg) rotateY(${h3dRy}deg)`;
            raf(animateHero3d);
        }
        raf(animateHero3d);
    }

    /* ========== KINETIC HERO TEXT ========== */
    const heroAccentLine = $('.hero__line--accent');
    if (heroAccentLine && !prefersReducedMotion) {
        let kineticActive = false;
        const heroSection = $('#hero');
        window.addEventListener('scroll', () => {
            const pct = window.scrollY / window.innerHeight;
            if (pct > 0.05 && pct < 0.5 && !kineticActive) {
                kineticActive = true;
                heroAccentLine.classList.add('is-kinetic');
            } else if ((pct <= 0.05 || pct >= 0.5) && kineticActive) {
                kineticActive = false;
                heroAccentLine.classList.remove('is-kinetic');
            }
        }, { passive: true });
    }

    /* ========== HERO SCROLL DISTORTION ========== */
    if (!prefersReducedMotion) {
        const heroText = $('.hero__text');
        const heroVisual = $('.hero__visual');
        const heroEl = $('#hero');
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroH = window.innerHeight;
            if (scrollY < heroH) {
                const pct = scrollY / heroH;
                // Parallax
                if (heroText) heroText.style.transform = `translateY(${pct * 80}px)`;
                if (heroVisual) heroVisual.style.transform = `translateY(${pct * 40}px) scale(${1 - pct * 0.1})`;
                // Hero compression
                if (heroEl) heroEl.style.transform = `scale(${1 - pct * 0.04})`;
            } else {
                if (heroEl) heroEl.style.transform = '';
            }
        }, { passive: true });
    }

    /* ========== SCROLL REVEAL (IntersectionObserver) ========== */
    function initRevealObserver() {
        if (prefersReducedMotion) {
            $$('.reveal').forEach(el => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        $$('.reveal').forEach(el => observer.observe(el));
    }

    /* ========== ANIMATED COUNTERS ========== */
    function animateCounters() {
        const counters = $$('[data-target]');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.target);
                    const suffix = el.dataset.suffix || '';
                    const prefix = el.dataset.prefix || '';
                    const isDecimal = el.dataset.decimal === 'true';
                    const duration = 2200;
                    const start = performance.now();
                    function step(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 4);
                        const current = isDecimal ? (target * eased).toFixed(1) : Math.floor(target * eased);
                        el.textContent = prefix + current + suffix;
                        if (progress < 1) raf(step);
                        else {
                            // Pulse on completion
                            el.style.transition = 'transform .3s var(--ease-bounce)';
                            el.style.transform = 'scale(1.08)';
                            setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
                        }
                    }
                    raf(step);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => observer.observe(c));
    }
    animateCounters();

    /* ========== SHOWCASE CAROUSEL — 3D Coverflow ========== */
    const carouselTrack = $('#showcaseTrack');
    const carouselEl = $('#showcaseCarousel');
    const carouselCards = $$('.showcase__card');
    const carouselDotsContainer = $('#carouselDots');
    const prevBtn = $('#carouselPrev');
    const nextBtn = $('#carouselNext');
    let currentSlide = 0;
    const totalSlides = carouselCards.length;
    let isDragging = false, dragStartX = 0, dragOffset = 0;
    let velocity = 0;
    let didDrag = false;
    let lastDragEndedAt = 0;
    let autoplayTimer = null;

    // Create dots
    carouselCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'showcase__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to project ${i + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(i);
            restartAutoplay();
        });
        carouselDotsContainer.appendChild(dot);
    });

    function goToSlide(idx) {
        currentSlide = clamp(idx, 0, totalSlides - 1);
        updateCarousel();
    }

    function goToSlideWrapped(idx) {
        if (!totalSlides) return;
        currentSlide = ((idx % totalSlides) + totalSlides) % totalSlides;
        updateCarousel();
    }

    function restartAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            if (!isDragging && modal?.hidden !== false) {
                goToSlideWrapped(currentSlide + 1);
            }
        }, 5000);
    }

    function getTrackOffsetForSlide(idx) {
        const targetCard = carouselCards[idx];
        if (!targetCard) return 0;
        const cardCenterInTrack = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
        return (carouselEl.clientWidth / 2) - cardCenterInTrack;
    }

    function updateCarousel() {
        if (!carouselCards.length) return;
        const offset = getTrackOffsetForSlide(currentSlide);
        carouselTrack.style.transform = `translateX(${offset}px)`;

        carouselCards.forEach((card, i) => {
            card.classList.remove('is-active', 'is-prev', 'is-next');
            if (i === currentSlide) card.classList.add('is-active');
            else if (i === currentSlide - 1) card.classList.add('is-prev');
            else if (i === currentSlide + 1) card.classList.add('is-next');
        });
        $$('.showcase__dot').forEach((dot, i) => {
            dot.classList.toggle('is-active', i === currentSlide);
        });
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        restartAutoplay();
    });
    nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        restartAutoplay();
    });

    updateCarousel();
    // Ensure correct centering after any late layout changes
    setTimeout(updateCarousel, 120);

    // Recalculate centering on resize (debounced)
    let _carouselResizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(_carouselResizeTimer);
        _carouselResizeTimer = setTimeout(() => updateCarousel(), 120);
    });



    // Drag with inertia
    let lastDragX = 0, lastDragTime = 0;

    carouselEl.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        isDragging = true;
        didDrag = false;
        dragStartX = e.clientX;
        lastDragX = e.clientX;
        lastDragTime = performance.now();
        velocity = 0;
        carouselTrack.style.transition = 'none';
        carouselEl.setPointerCapture(e.pointerId);
        restartAutoplay();
    });
    carouselEl.addEventListener('pointermove', e => {
        if (!isDragging) return;
        const now = performance.now();
        const dx = e.clientX - lastDragX;
        const dt = now - lastDragTime;
        if (dt > 0) velocity = dx / dt;
        lastDragX = e.clientX;
        lastDragTime = now;

        dragOffset = e.clientX - dragStartX;
        if (Math.abs(dragOffset) > 6) didDrag = true;
        const base = getTrackOffsetForSlide(currentSlide);
        carouselTrack.style.transform = `translateX(${base + dragOffset}px)`;
    });
    const finishDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        carouselTrack.style.transition = '';
        const dragged = didDrag || Math.abs(dragOffset) > 6;

        // Inertia: use velocity to decide
        const inertiaThreshold = 0.3;
        if (Math.abs(velocity) > inertiaThreshold || Math.abs(dragOffset) > 100) {
            if (dragOffset < 0 || velocity < -inertiaThreshold) goToSlide(currentSlide + 1);
            else goToSlide(currentSlide - 1);
        } else {
            updateCarousel();
        }
        if (dragged) lastDragEndedAt = performance.now();
        dragOffset = 0; velocity = 0;
        restartAutoplay();
    };
    carouselEl.addEventListener('pointerup', finishDrag);
    carouselEl.addEventListener('pointercancel', finishDrag);
    carouselEl.addEventListener('lostpointercapture', finishDrag);

    // Scroll wheel control
    carouselEl.addEventListener('wheel', e => {
        e.preventDefault();
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            if (e.deltaX > 30) goToSlide(currentSlide + 1);
            else if (e.deltaX < -30) goToSlide(currentSlide - 1);
        } else {
            if (e.deltaY > 30) goToSlide(currentSlide + 1);
            else if (e.deltaY < -30) goToSlide(currentSlide - 1);
        }
        restartAutoplay();
    }, { passive: false });

    // Removed hover-tilt to simplify interactions; hover styling handled in CSS

    // Device toggle
    $$('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.device-btn').forEach(b => b.classList.remove('device-btn--active'));
            btn.classList.add('device-btn--active');
            const device = btn.dataset.device;
            carouselCards.forEach(card => {
                card.removeAttribute('data-device');
                if (device !== 'desktop') card.setAttribute('data-device', device);
            });
            updateCarousel();
            restartAutoplay();
        });
    });

    // Fullscreen modal
    const modal = $('#showcaseModal');
    const modalContent = $('#modalContent');
    const modalClose = $('#modalClose');
    const openShowcaseCard = card => {
        if (!card) return;
        const inner = card.querySelector('.showcase__card-inner');
        if (!inner) return;
        modalContent.innerHTML = inner.outerHTML;
        modal.hidden = false;
        raf(() => modal.classList.add('is-open'));
        restartAutoplay();
    };

    carouselCards.forEach(card => {
        card.addEventListener('click', e => {
            if (didDrag || (performance.now() - lastDragEndedAt < 180)) return;
            e.stopPropagation();
            openShowcaseCard(card);
        });
    });
    carouselEl.addEventListener('click', e => {
        if (didDrag || (performance.now() - lastDragEndedAt < 180)) return;
        const directCard = e.target.closest('.showcase__card');
        const hoveredCard = document.elementFromPoint(e.clientX, e.clientY)?.closest('.showcase__card');
        openShowcaseCard(directCard || hoveredCard);
    });
    function closeModal() {
        modal.classList.remove('is-open');
        setTimeout(() => { modal.hidden = true; modalContent.innerHTML = ''; }, 500);
    }
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    carouselEl.addEventListener('mouseenter', () => { if (autoplayTimer) clearInterval(autoplayTimer); });
    carouselEl.addEventListener('mouseleave', restartAutoplay);
    restartAutoplay();

    /* ========== SERVICES — Enhanced Interaction ========== */
    $$('.services__card').forEach(card => {
        card.addEventListener('click', () => {
            const expanded = card.getAttribute('aria-expanded') === 'true';
            $$('.services__card').forEach(c => c.setAttribute('aria-expanded', 'false'));
            if (!expanded) card.setAttribute('aria-expanded', 'true');
        });

        // Magnetic hover on cards
        if (!isTouchDevice) {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `translateY(-8px) scale(1.02) translate(${x * 0.02}px, ${y * 0.02}px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        }
    });

    /* ========== CASE STUDY — 3D Tilt ========== */
    if (!isTouchDevice) {
        $$('.cases__card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `translateY(-10px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ========== TESTIMONIALS — Infinite Loop ========== */
    const testimonialTrack = $('#testimonialTrack');
    if (testimonialTrack) {
        const cards = testimonialTrack.innerHTML;
        testimonialTrack.innerHTML = cards + cards;
    }

    /* ========== TIMELINE — Animated Line Fill ========== */
    function initTimelineScroll() {
        const timelineLine = $('.about__timeline-line-fill');
        const timeline = $('.about__timeline');
        if (!timelineLine || !timeline) return;

        const timelineItems = $$('.about__timeline-item');

        function updateTimeline() {
            const rect = timeline.getBoundingClientRect();
            const windowH = window.innerHeight;
            const start = rect.top;
            const end = rect.bottom;
            const totalH = end - start;

            if (start < windowH && end > 0) {
                const scrolled = Math.max(0, windowH - start);
                const pct = Math.min(scrolled / totalH, 1) * 100;
                timelineLine.style.height = pct + '%';
            }

            // Activate dots
            timelineItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                if (itemRect.top < windowH * 0.7) {
                    item.classList.add('is-visible');
                }
            });
        }
        window.addEventListener('scroll', updateTimeline, { passive: true });
        updateTimeline();
    }

    /* ========== CTA CANVAS — Starfield + Ambient ========== */
    const ctaCanvas = $('#ctaCanvas');
    if (ctaCanvas) {
        const ctx2 = ctaCanvas.getContext('2d');
        let cW, cH;
        const stars = [];

        function resizeCta() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            cW = ctaCanvas.clientWidth; cH = ctaCanvas.clientHeight;
            ctaCanvas.width = cW * dpr; ctaCanvas.height = cH * dpr;
            ctx2.scale(dpr, dpr);
        }
        resizeCta();
        window.addEventListener('resize', resizeCta);

        for (let i = 0; i < 120; i++) {
            stars.push({
                x: Math.random() * 2000, y: Math.random() * 1200,
                r: Math.random() * 1.2 + 0.2,
                baseO: Math.random() * 0.4 + 0.05,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.3 + 0.05,
            });
        }

        function drawCta() {
            ctx2.clearRect(0, 0, cW, cH);

            // Ambient core glow
            const grad = ctx2.createRadialGradient(cW / 2, cH / 2, 0, cW / 2, cH / 2, cW * 0.45);
            grad.addColorStop(0, 'rgba(123,97,255,.05)');
            grad.addColorStop(0.5, 'rgba(224,86,160,.02)');
            grad.addColorStop(1, 'transparent');
            ctx2.fillStyle = grad;
            ctx2.fillRect(0, 0, cW, cH);

            // Draw stars with twinkle
            const time = performance.now() / 1000;
            stars.forEach(s => {
                s.x += s.speed * 0.1;
                if (s.x > cW) s.x = 0;
                const twinkle = (Math.sin(time * 1.5 + s.phase) + 1) / 2;
                const opacity = s.baseO * (0.3 + twinkle * 0.7);
                ctx2.beginPath();
                ctx2.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx2.fillStyle = `rgba(255,255,255,${opacity})`;
                ctx2.fill();
            });

            raf(drawCta);
        }
        drawCta();
    }

    /* ========== RIPPLE EFFECT ON BUTTONS ========== */
    $$('.btn--primary').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.style.cssText = `
            position:absolute; border-radius:50%;
            background:rgba(255,255,255,.25);
            width:0; height:0; left:${x}px; top:${y}px;
            transform:translate(-50%,-50%);
            pointer-events:none;
            animation: rippleAnim .7s ease forwards;
        `;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });
    // Inject ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `@keyframes rippleAnim { to { width: 400px; height: 400px; opacity: 0; } }`;
    document.head.appendChild(rippleStyle);

    /* ========== CHATBOT ========== */
    const chatToggle = $('#chatToggle');
    const chatWindow = $('#chatWindow');
    const chatClose = $('#chatClose');
    const chatForm = $('#chatForm');
    const chatInput = $('#chatInput');
    const chatMessages = $('#chatMessages');
    const chatQuick = $('#chatQuick');
    const chatBadge = $('.chatbot__badge');

    const botResponses = {
        'I\'d like to start a project': 'That\'s fantastic! 🚀 We\'d love to learn about your project. Could you share a brief overview of what you\'re looking to build? We\'ll get back to you within 24 hours.',
        'What services do you offer?': 'We specialize in Web Development, UI/UX Design, Brand Strategy, Motion & 3D, Growth & SEO, and Product Design. Each service delivers award-winning digital experiences.',
        'Can I see your pricing?': 'Our projects typically start at $15K for focused engagements. We\'d love to understand your vision — let\'s schedule a free 30-minute discovery call!',
    };

    function addMessage(text, type = 'bot') {
        const msg = document.createElement('div');
        msg.className = `chatbot__msg chatbot__msg--${type}`;
        msg.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatToggle.addEventListener('click', () => {
        chatWindow.hidden = false;
        chatBadge.style.display = 'none';
        raf(() => chatWindow.classList.add('is-open'));
    });
    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('is-open');
        setTimeout(() => { chatWindow.hidden = true; }, 400);
    });

    $$('.chatbot__quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = btn.dataset.msg;
            addMessage(msg, 'user');
            chatQuick.style.display = 'none';
            setTimeout(() => {
                addMessage(botResponses[msg] || 'Thanks for reaching out! A team member will follow up shortly.');
            }, 800);
        });
    });

    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (!val) return;
        addMessage(val, 'user');
        chatInput.value = '';
        chatQuick.style.display = 'none';
        setTimeout(() => {
            addMessage('Thanks for your message! Our team will review and respond within 24 hours. Explore our work above in the meantime! 🎨');
        }, 1000);
    });

    /* ========== KEYBOARD ACCESSIBILITY ========== */
    $$('.services__card').forEach(card => {
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
    });
    document.addEventListener('keydown', e => {
        if (document.activeElement?.closest('.showcase')) {
            if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
            if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
        }
    });

})();
