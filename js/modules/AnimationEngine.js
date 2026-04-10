export class AnimationEngine {
    constructor(options = {}) {
        this.threshold = options.threshold || 0.1;
        this.duration = options.duration || 2000;
        this.observer = this._initObserver();
    }

    _initObserver() {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('is-visible');

                    // If it has a counter attribute, trigger the math loop
                    if (el.hasAttribute('data-count-to')) {
                        const target = parseInt(el.getAttribute('data-count-to'), 10);
                        this.animateNumbers(el, 0, target, this.duration);
                    }

                    this.observer.unobserve(el);
                }
            });
        }, { threshold: this.threshold });
    }

    observe(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => this.observer.observe(el));
    }

    animateNumbers(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const currentNumber = Math.floor(progress * (end - start) + start);
            element.innerHTML = currentNumber.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}