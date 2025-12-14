document.addEventListener('DOMContentLoaded', function() {
    // --- Navigation & Mobile Menu ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open'); // Prevent scroll
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTop');
    if(backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Stats Counter Animation ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const statsSection = document.querySelector('#stats');
    if(statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numbers = entry.target.querySelectorAll('.stat-number');
                    numbers.forEach(num => {
                        const target = parseInt(num.getAttribute('data-target'));
                        const duration = 2000; 
                        const increment = target / (duration / 16); 
                        let current = 0;

                        const updateNumber = () => {
                            current += increment;
                            if (current < target) {
                                num.textContent = Math.round(current);
                                requestAnimationFrame(updateNumber);
                            } else {
                                num.textContent = target + '+';
                            }
                        };

                        requestAnimationFrame(updateNumber);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(statsSection);
    }

    // --- Testimonial Carousel ---
    const carousel = document.querySelector('.testimonial-carousel');
    if(carousel) {
        const cards = document.querySelectorAll('.testimonial-card');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        let currentIndex = 0;
        let cardsPerView = getCardsPerView();
        
        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }
        
        function updateCarousel() {
            const cardWidth = 100 / cardsPerView;
            cards.forEach(card => {
                card.style.flex = `0 0 ${cardWidth}%`;
                // Adjust margin calculation if necessary, simplified here for flex
                // The CSS defines margin, so we might need to account for it or remove it in JS control
                // For this implementation, we'll rely on the CSS flex-basis
            });
            // Simple translation
            const translateValue = -(currentIndex * (100 / cardsPerView));
            carousel.style.transform = `translateX(${translateValue}%)`;
        }
        
        function nextSlide() {
            const maxIndex = cards.length - cardsPerView;
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        }
        
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        if(nextBtn) nextBtn.addEventListener('click', nextSlide);
        if(prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        window.addEventListener('resize', function() {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                cardsPerView = newCardsPerView;
                currentIndex = 0;
                updateCarousel();
            }
        });
        
        // Initial setup
        updateCarousel();
    }

    // --- FAQ Accordion ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            // Close others (optional)
            // document.querySelectorAll('.faq-item').forEach(item => {
            //     if(item !== faqItem) item.classList.remove('active');
            // });
            faqItem.classList.toggle('active');
        });
    });

    // --- Live Chat Widget ---
    const chatToggle = document.querySelector('.chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const closeChat = document.querySelector('.close-chat');
    const sendMessage = document.querySelector('.send-message');
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');

    if (chatToggle && chatContainer) {
        chatToggle.addEventListener('click', () => {
            const isVisible = chatContainer.style.display === 'flex' || chatContainer.classList.contains('active');
            if (isVisible) {
                chatContainer.style.display = 'none';
                chatContainer.classList.remove('active');
            } else {
                chatContainer.style.display = 'flex';
                // Small delay to allow display flex to apply before opacity transition if we had one
                setTimeout(() => chatContainer.classList.add('active'), 10);
                if(chatInput) chatInput.focus();
            }
        });

        if(closeChat) {
            closeChat.addEventListener('click', () => {
                chatContainer.style.display = 'none';
                chatContainer.classList.remove('active');
            });
        }

        function sendChatMessage() {
            if(!chatInput || !chatMessages) return;
            const message = chatInput.value.trim();
            if (message) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message user-message';
                messageElement.innerHTML = `<p>${escapeHtml(message)}</p>`;
                chatMessages.appendChild(messageElement);
                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Simulate auto-reply
                setTimeout(() => {
                    const autoReply = document.createElement('div');
                    autoReply.className = 'message bot-message';
                    autoReply.innerHTML = `<p>Thanks for your message! Our team will get back to you shortly.</p>`;
                    chatMessages.appendChild(autoReply);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        }

        if(sendMessage) sendMessage.addEventListener('click', sendChatMessage);
        
        if(chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatMessage();
            });
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Calendar Implementation ---
    const calendarGrid = document.querySelector('.calendar-grid');
    if(calendarGrid) {
        const currentMonthElement = document.querySelector('.current-month');
        const prevMonthBtn = document.querySelector('.prev-month');
        const nextMonthBtn = document.querySelector('.next-month');

        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        function updateCalendar() {
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const startingDay = firstDay.getDay();
            const monthLength = lastDay.getDate();

            if(currentMonthElement) currentMonthElement.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;

            calendarGrid.innerHTML = '';

            // Add day labels
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(day => {
                const dayLabel = document.createElement('div');
                dayLabel.className = 'calendar-day-label';
                dayLabel.textContent = day;
                calendarGrid.appendChild(dayLabel);
            });

            // Add blank spaces for starting day
            for (let i = 0; i < startingDay; i++) {
                const blankDay = document.createElement('div');
                blankDay.className = 'calendar-day empty';
                calendarGrid.appendChild(blankDay);
            }

            // Add days
            for (let i = 1; i <= monthLength; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = i;
                
                // Disable past dates
                const dateToCheck = new Date(currentYear, currentMonth, i);
                if (dateToCheck < new Date().setHours(0,0,0,0)) {
                    dayElement.classList.add('disabled');
                } else {
                    dayElement.addEventListener('click', () => selectDate(i));
                }
                
                calendarGrid.appendChild(dayElement);
            }
        }

        function selectDate(day) {
            const dateInput = document.getElementById('date');
            const selectedDate = new Date(currentYear, currentMonth, day);
            // Format for date input: YYYY-MM-DD
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedDate.getDate()).padStart(2, '0');
            
            if(dateInput) dateInput.value = `${year}-${month}-${d}`;
            
            // Highlight selected day visually
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            // This simple logic might need improvement to match exact element, but good for now
        }

        if(prevMonthBtn) {
            prevMonthBtn.addEventListener('click', (e) => {
                e.preventDefault(); // prevent form submit if inside form
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                updateCalendar();
            });
        }

        if(nextMonthBtn) {
            nextMonthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                updateCalendar();
            });
        }

        updateCalendar();
    }

    // --- Booking Form Handling ---
    const bookingForm = document.getElementById('bookingForm');
    if(bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const bookingData = Object.fromEntries(formData);
            bookingData.submissionTime = new Date().toLocaleString();
            
            const bookingText = `
Booking Details:
---------------
Date: ${bookingData.submissionTime}
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Service: ${bookingData.service}
Preferred Date: ${bookingData.date}
Additional Notes: ${bookingData.message}
---------------
`;
            // Simplified for demo - just alert
            alert('Booking received! We will contact you shortly.');
            this.reset();
        });
    }
});
