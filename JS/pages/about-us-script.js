
document.addEventListener('DOMContentLoaded', () => {

    const ACCENT_GOLD = '#ffcc00';
    const FOUNDING_YEAR = 1892;
    const COUNTER_DURATION_MS = 1500;
    const COUNTER_STEP_MS = 20;

    const progressBarStyle = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: ${ACCENT_GOLD}; 
            width: 0%;
            z-index: 1000;
            transition: width 0.1s ease;
        `;
    const handleScrollProgress = () => {
        const progressBar = document.createElement('div');
        
        progressBar.style.cssText = progressBarStyle;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (height === 0) return;

            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = `${scrolled}%`;
        });
    };

   
    const animateRewardsCounter = () => {
        const amountSpan = document.querySelector('.currency-badge .amount');
        
        if (!amountSpan) return;

        const targetValue = parseInt(amountSpan.textContent.replace(',', '')) || 1240;
        const increment = targetValue / (COUNTER_DURATION_MS / COUNTER_STEP_MS);
        let startValue = 0;

        const counterInterval = setInterval(() => {
            startValue += increment;

            if (startValue >= targetValue) {
                amountSpan.textContent = targetValue.toLocaleString();
                clearInterval(counterInterval);
                return;
            }

            amountSpan.textContent = Math.floor(startValue).toLocaleString();
        }, COUNTER_STEP_MS);
    };

  
    const initializeScrollAnimations = () => {
        const revealOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const { target, isIntersecting } = entry;

                if (isIntersecting) {
                    target.style.opacity = "1";
                    target.style.transform = "translateY(0)";
                    return;
                }

                target.style.opacity = "0";
                target.style.transform = "translateY(20px)";
            });
        }, revealOptions);

        const contentSections = document.querySelectorAll('.philosophy, .card, .history, .collective-badge');

        contentSections.forEach((section) => {
            section.style.opacity = "0";
            section.style.transform = "translateY(20px)";
            section.style.transition = "all 0.8s ease-in-out";
            revealObserver.observe(section);
        });
    };

    
    const handleNewsletterSubscription = () => {
        const newsletterBtn = document.querySelector('.btn-gold');
        const newsletterInput = document.querySelector('.newsletter-form input');
        const newsletterContainer = document.querySelector('.newsletter-form');

        if (!newsletterContainer) return;

        if (localStorage.getItem('duckCollectiveJoined') === 'true') {
            newsletterContainer.innerHTML = `<p style="color: ${ACCENT_GOLD}; font-weight: bold;">You are already a member of the Collective!</p>`;
            return;
        }

        if (!newsletterBtn || !newsletterInput) return;

        newsletterBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const email = newsletterInput.value.trim();

            if (!email.includes('@')) {
                newsletterInput.style.border = "1px solid red";
                setTimeout(() => {
                    newsletterInput.style.border = "";
                }, 2000);
                return;
            }

            localStorage.setItem('duckCollectiveJoined', 'true');
            newsletterBtn.textContent = "Welcome!";
            newsletterBtn.style.filter = "grayscale(1)";

            setTimeout(() => {
                newsletterContainer.innerHTML = `<p style="color: ${ACCENT_GOLD}; animation: fadeIn 0.5s;">Thank you for joining our story!</p>`;
            }, 800);
        });
    };

    
    const displayLegacyYears = () => {
        const heroSub = document.querySelector('.hero-sub');
        
        if (!heroSub) return;

        const currentYear = new Date().getFullYear();
        const totalYears = currentYear - FOUNDING_YEAR;
        const legacyText = document.createElement('div');

        legacyText.style.marginTop = "15px";
        legacyText.style.color = ACCENT_GOLD;
        legacyText.style.fontWeight = "bold";
        legacyText.innerText = `Celebrating ${totalYears} Years of Duck Store.`;
        
        heroSub.appendChild(legacyText);
    };

    handleScrollProgress();
    animateRewardsCounter();
    initializeScrollAnimations();
    handleNewsletterSubscription();
    displayLegacyYears();
});