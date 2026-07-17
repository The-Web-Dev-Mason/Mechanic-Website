document.addEventListener('DOMContentLoaded', function () {

    // ================================================
    // NAVBAR — scroll effect & mobile menu
    // ================================================
    const navbar         = document.querySelector('.navbar');
    const mobileMenuBtn  = document.querySelector('.mobile-menu-btn');
    const navMenu        = document.querySelector('.nav-menu');
    const navOverlay     = document.querySelector('.nav-overlay');

    function openMenu() {
        navMenu.classList.add('active');
        navOverlay.classList.add('active');
        document.body.classList.add('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.setAttribute('aria-label', 'Close navigation menu');
        mobileMenuBtn.querySelector('i').className = 'fas fa-times';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open navigation menu');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('active');
            isOpen ? closeMenu() : openMenu();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Navbar scroll effect
    function handleNavbarScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // run on load

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-height')) || 70;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ================================================
    // BACK TO TOP
    // ================================================
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ================================================
    // STATS COUNTER ANIMATION (IntersectionObserver)
    // ================================================
    const statsSection = document.querySelector('#stats');
    if (statsSection) {
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    entry.target.querySelectorAll('.stat-number').forEach(num => {
                        const target   = parseInt(num.getAttribute('data-target'));
                        const duration = 2000;
                        const step     = target / (duration / 16);
                        let current    = 0;

                        const tick = () => {
                            current += step;
                            if (current < target) {
                                num.textContent = Math.round(current);
                                requestAnimationFrame(tick);
                            } else {
                                num.textContent = target + '+';
                            }
                        };
                        requestAnimationFrame(tick);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statsSection);
    }

    // ================================================
    // TESTIMONIAL CAROUSEL (with dots & touch/swipe)
    // ================================================
    const carousel = document.querySelector('.testimonial-carousel');
    if (carousel) {
        const cards      = Array.from(document.querySelectorAll('.testimonial-card'));
        const prevBtn    = document.querySelector('.prev-btn');
        const nextBtn    = document.querySelector('.next-btn');
        const dotsWrap   = document.querySelector('.carousel-dots');

        let currentIndex  = 0;
        let cardsPerView  = getCardsPerView();
        let totalSlides   = Math.ceil(cards.length / cardsPerView);
        let dots          = [];

        // --- Touch/swipe state ---
        let touchStartX = 0;
        let touchEndX   = 0;

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            dots = [];
            totalSlides = Math.ceil(cards.length / cardsPerView);
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
                dots.push(dot);
            }
        }

        function updateDots() {
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        function updateCarousel() {
            const cardPct = 100 / cardsPerView;
            cards.forEach(card => {
                card.style.flex = `0 0 ${cardPct}%`;
            });
            const translatePct = -(currentIndex * 100);
            carousel.style.transform = `translateX(${translatePct}%)`;
            updateDots();

            // Disable buttons at boundaries
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= totalSlides - 1;
        }

        function goTo(index) {
            currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
            updateCarousel();
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }

        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        // Touch/swipe support
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? next() : prev();
            }
        }, { passive: true });

        // Keyboard navigation
        carousel.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        });

        // Resize handler
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newCPV = getCardsPerView();
                if (newCPV !== cardsPerView) {
                    cardsPerView  = newCPV;
                    currentIndex  = 0;
                    buildDots();
                    updateCarousel();
                }
            }, 150);
        });

        // Init
        buildDots();
        updateCarousel();
    }

    // ================================================
    // FAQ ACCORDION (accessible)
    // ================================================
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item     = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(el => {
                el.classList.remove('active');
                el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Open clicked (unless it was already open)
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // CALENDAR
    // ================================================
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        const currentMonthEl = document.querySelector('.current-month');
        const prevMonthBtn   = document.querySelector('.prev-month');
        const nextMonthBtn   = document.querySelector('.next-month');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let viewMonth = today.getMonth();
        let viewYear  = today.getFullYear();

        const monthNames = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];

        function renderCalendar() {
            const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

            if (currentMonthEl) {
                currentMonthEl.textContent = `${monthNames[viewMonth]} ${viewYear}`;
            }

            calendarGrid.innerHTML = '';

            // Day headers
            ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
                const lbl = document.createElement('div');
                lbl.className = 'calendar-day-label';
                lbl.textContent = d;
                lbl.setAttribute('aria-hidden', 'true');
                calendarGrid.appendChild(lbl);
            });

            // Blank days before first
            for (let i = 0; i < firstDay; i++) {
                const blank = document.createElement('div');
                blank.className = 'calendar-day empty';
                blank.setAttribute('aria-hidden', 'true');
                calendarGrid.appendChild(blank);
            }

            // Day cells
            const dateInput = document.getElementById('date');
            const selectedVal = dateInput ? dateInput.value : '';

            for (let day = 1; day <= daysInMonth; day++) {
                const cell   = document.createElement('button');
                cell.type    = 'button';
                cell.className = 'calendar-day';
                cell.textContent = day;

                const cellDate = new Date(viewYear, viewMonth, day);
                const cellISO  = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

                cell.setAttribute('aria-label', cellDate.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }));

                if (cellDate < today) {
                    cell.classList.add('disabled');
                    cell.setAttribute('disabled', '');
                    cell.setAttribute('aria-disabled', 'true');
                } else {
                    if (cellISO === selectedVal) cell.classList.add('selected');
                    if (cellDate.getTime() === today.getTime()) cell.classList.add('today');
                    cell.addEventListener('click', () => selectDate(cellISO, cell));
                }

                calendarGrid.appendChild(cell);
            }
        }

        function selectDate(isoString, clickedCell) {
            // Update input
            const dateInput = document.getElementById('date');
            if (dateInput) dateInput.value = isoString;

            // Update highlight
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            clickedCell.classList.add('selected');
        }

        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                viewMonth--;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                viewMonth++;
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                renderCalendar();
            });
        }

        // Keep calendar in sync when user types in the date input
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                if (dateInput.value) {
                    const d = new Date(dateInput.value + 'T00:00:00');
                    viewMonth = d.getMonth();
                    viewYear  = d.getFullYear();
                    renderCalendar();
                }
            });
        }

        renderCalendar();
    }

    // ================================================
    // BOOKING FORM
    // ================================================
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!this.checkValidity()) {
                this.reportValidity();
                return;
            }

            const data = Object.fromEntries(new FormData(this));
            console.info('Booking submitted:', data);

            // Replace button with success message
            const btn = this.querySelector('.submit-btn');
            btn.textContent = '✓ Booking Received!';
            btn.style.background = '#27ae60';
            btn.disabled = true;

            setTimeout(() => {
                this.reset();
                btn.textContent  = 'Book Appointment';
                btn.style.background = '';
                btn.disabled     = false;
            }, 4000);
        });
    }

    // ================================================
    // SCROLL REVEAL (lightweight, no library)
    // ================================================
    const revealEls = document.querySelectorAll(
        '.service, .feature-card, .pricing-card, .faq-item, .stat-item'
    );

    if ('IntersectionObserver' in window && revealEls.length) {
        revealEls.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => revealObserver.observe(el));
    }
});
