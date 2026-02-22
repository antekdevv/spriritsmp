/* ============================================
   SpiritSMP — Minecraft JavaScript
   ============================================ */

// No global music player anymore

document.addEventListener('DOMContentLoaded', () => {
    // --- Particles Background (Dust/Spores) ---
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class FireParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() > 0.8 ? 3 : 1.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = -(Math.random() * 1 + 0.5); // Embers float up
            this.opacity = Math.random() * 0.8 + 0.2;
            const colors = ['#FF9F1C', '#E48A12', '#C97209']; // Orange tones
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = 0;
            this.maxLife = Math.random() * 100 + 50;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life++;

            // Flicker effect
            if (this.life % 10 === 0) {
                this.opacity = Math.random() * 0.8 + 0.2;
            }

            // Mouse repulsion
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                this.x -= dx * 0.05;
                this.y -= dy * 0.05;
                this.opacity = Math.min(1, this.opacity + 0.2);
            }

            if (this.x < 0 || this.x > canvas.width || this.y < -10 || this.life > this.maxLife) {
                this.reset();
                this.y = canvas.height + 10; // Start from bottom
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.x, this.y, this.size, this.size);
            // Optional: slight glow
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
            ctx.globalAlpha = 1;
        }
    }

    class WaterParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() > 0.8 ? 4 : 2;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = Math.random() * 1.5 + 1; // Droplets fall down
            this.opacity = Math.random() * 0.5 + 0.1;
            const colors = ['#21B7C9', '#1598A8', '#BDEEF4']; // Sea blue tones
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                this.x -= dx * 0.03;
                this.y -= dy * 0.03;
            }

            if (this.x < 0 || this.x > canvas.width || this.y > canvas.height + 10) {
                this.reset();
                this.y = -10; // Start from top
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            // Draw slightly elongated rect for rain effect
            ctx.fillRect(this.x, this.y, this.size, this.size * 1.5);
            ctx.globalAlpha = 1;
        }
    }

    const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000));
    for (let i = 0; i < particleCount; i++) {
        if (i % 2 === 0) {
            particles.push(new FireParticle());
        } else {
            particles.push(new WaterParticle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- Cursor Tracking ---
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // --- Navbar Mobile Menu ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // --- Hidden IP ---
    const ipBox = document.getElementById('ipBox');
    if (ipBox) {
        ipBox.style.cursor = 'default';
        ipBox.title = 'IP ukryte – tylko dla zweryfikowanych YouTuberów';
    }

    // --- Form Submission Handling ---
    const form = document.getElementById('applicationForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.querySelector('.submit-text');
    const submitLoading = document.querySelector('.submit-loading');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const channelInput = document.getElementById('channel');
    const channelError = document.getElementById('channelError');
    const screenshotsInput = document.getElementById('screenshots');
    const filePickerStatus = document.getElementById('filePickerStatus');
    const fileList = document.getElementById('fileList');

    function isYoutubeUrl(value) {
        try {
            const url = new URL(value);
            const host = url.hostname.toLowerCase().replace(/^www\./, '');
            return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com');
        } catch (_) {
            return false;
        }
    }

    function showFieldError(input, message, errorEl) {
        input.classList.add('invalid-input');
        input.setCustomValidity(message);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    function clearFieldError(input, errorEl) {
        input.classList.remove('invalid-input');
        input.setCustomValidity('');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    if (channelInput && channelError) {
        channelInput.addEventListener('input', () => clearFieldError(channelInput, channelError));
    }

    if (screenshotsInput && filePickerStatus && fileList) {
        screenshotsInput.addEventListener('change', () => {
            const files = Array.from(screenshotsInput.files || []);
            fileList.innerHTML = '';

            if (!files.length) {
                filePickerStatus.textContent = 'Nie wybrano plikow';
                return;
            }

            filePickerStatus.textContent = `Wybrano ${files.length} plik(ow)`;
            files.forEach(file => {
                const chip = document.createElement('span');
                chip.className = 'file-chip';
                chip.textContent = file.name;
                fileList.appendChild(chip);
            });
        });
    }

    function showSuccessState() {
        if (form) form.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
        const applySection = document.getElementById('apply');
        if (applySection) {
            applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    if (form && form.dataset.handler !== 'inline') {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (formError) formError.style.display = 'none';
            if (channelInput && channelError) clearFieldError(channelInput, channelError);
            if (channelInput && channelInput.value && !/^https?:\/\//i.test(channelInput.value.trim())) {
                channelInput.value = `https://${channelInput.value.trim()}`;
            }

            if (!form.checkValidity()) {
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalid.focus({ preventScroll: true });
                }
                form.reportValidity();
                if (formError) formError.style.display = 'block';
                return;
            }

            if (channelInput && !isYoutubeUrl(channelInput.value.trim())) {
                showFieldError(channelInput, 'Podaj poprawny link YouTube (youtube.com lub youtu.be).', channelError);
                channelInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                channelInput.focus({ preventScroll: true });
                channelInput.reportValidity();
                if (formError) formError.style.display = 'block';
                return;
            }

            submitText.style.display = 'none';
            submitLoading.style.display = 'inline-block';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.filter = 'brightness(0.7)';

            const formData = new FormData(form);
            const ajaxEndpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

            fetch(ajaxEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json().catch(() => ({}));
                })
                .then(() => {
                    showSuccessState();
                })
                .catch(() => {
                    if (formError) {
                        formError.textContent = 'Nie udalo sie wyslac formularza. Sprawdz pola i sprobuj ponownie.';
                        formError.style.display = 'block';
                    }
                    submitText.style.display = 'inline-block';
                    submitLoading.style.display = 'none';
                    submitBtn.style.pointerEvents = '';
                    submitBtn.style.filter = '';
                });
        });
    }

    // --- Animated Stat Counters ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                animateCounters();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats');
    if (statsSection) statsObserver.observe(statsSection);

    function animateCounters() {
        statNumbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const suffix = num.getAttribute('data-suffix') || '';
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(progress * target);
                num.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    num.textContent = target + suffix;
                }
            }
            requestAnimationFrame(update);
        });
    }

    // --- Scroll Reveal Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-item').forEach(el => revealObserver.observe(el));
    document.querySelectorAll('.about-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
    document.querySelectorAll('.section-header, .community-card, .requirements-card, .mc-form').forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 0.04, 0.24)}s`;
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
            el.classList.add('reveal');
        }
        revealObserver.observe(el);
    });

    // --- Konami Code Easter Egg (Herobrine / Glitch) ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    const easterEgg = document.getElementById('easterEgg');

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex] || e.key === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                easterEgg.classList.add('active');
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // --- UI Sound Effects (Hover & Click) ---
    const hoverSound = document.getElementById('hoverSound');
    const clickSound = document.getElementById('clickSound');

    if (hoverSound) {
        hoverSound.volume = 0.3; // Keep hover sound subtle
    }
    if (clickSound) {
        clickSound.volume = 0.5;
    }

    function playHoverSound() {
        if (!hoverSound) return;
        hoverSound.currentTime = 0;
        hoverSound.play().catch(e => { });
    }

    function playClickSound() {
        if (!clickSound) return;
        clickSound.currentTime = 0;
        clickSound.play().catch(e => { });
    }

    // Attach to all buttons, links, and cards
    const interactiveElements = document.querySelectorAll('a, button, .mc-card, .feature-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
        el.addEventListener('click', playClickSound); // This won't override default nav, just adds click sound before nav
    });

    // --- 3D Hover Tilt Effect ---
    const tiltElements = document.querySelectorAll('.mc-card, .feature-item, .hero-logo-img');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = ''; // reset to CSS default
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        el.addEventListener('mouseenter', () => {
            // Remove transition duration on enter for immediate tracking
            el.style.transition = 'transform 0.1s ease-out';
        });
    });

    console.log('%c⚔️ SpiritSMP', 'font-size: 32px; font-weight: bold; color: #55FF55; text-shadow: 2px 2px 0 #000;');
    console.log('%cSerwer Minecraft nie dla każdego.', 'font-size: 16px; color: #AAAAAA;');

});

